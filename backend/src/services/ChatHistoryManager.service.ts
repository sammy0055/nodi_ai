// services/ChatHistoryManager.ts

import OpenAI from 'openai';
import { ChatMessage } from '../models/chat-messages.model';
import { Conversation } from '../models/conversation.model';
import { OpenAIToolCall, OpenAIRole, OpenAIToolResult } from '../types/chat';
import { encode } from 'gpt-tokenizer';
import { appConfig } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { AiChatHistoryModel } from '../models/ai-chat-history.model';
import { Op } from 'sequelize';

export interface ChatHistoryConfig {
  maxContextTokens: number;
  compressionThreshold: number;
  keepRecentMessages: number;
  tokenBuffer: number;
}

interface CreateConversationProps {
  organizationId: string;
  customerId: string;
  title?: string; //to be removed in future
  systemPrompt?: string;
}

interface AIChatMessageAttributes {
  message: any;
  conversation_id: string;
  tokenCount: number;
}

export class ChatHistoryManager {
  private config: ChatHistoryConfig;

  constructor(config: Partial<ChatHistoryConfig> = {}) {
    this.config = {
      maxContextTokens: 6000,
      compressionThreshold: 5000,
      keepRecentMessages: 7,
      tokenBuffer: 500,
      ...config,
    };
  }

  // Create a new conversation
  async createConversation({ organizationId, customerId, title }: CreateConversationProps): Promise<Conversation> {
    return await Conversation.create({
      id: uuidv4(),
      organizationId: organizationId,
      customerId: customerId,
      title: title,
    });
  }

  // Add a message with proper OpenAI structure
  async addMessage(
    conversationId: string,
    message: {
      role: OpenAIRole;
      content: string | null;
      tool_calls?: OpenAIToolCall[];
      tool_call_id?: string;
      tool_results?: OpenAIToolResult[];
    }
  ): Promise<ChatMessage> {
    // Get current max message index
    const maxIndex =
      ((await ChatMessage.max('message_index', {
        where: { conversation_id: conversationId },
      })) as number) || -1;

    const messageIndex = maxIndex + 1;
    const tokens = this.estimateTokens(message.content || '');

    const chatMessage = await ChatMessage.create({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      tool_calls: message.tool_calls,
      tool_call_id: message.tool_call_id,
      tool_results: message.tool_results,
      tokens: tokens,
      message_index: messageIndex,
    });

    // Update conversation timestamp
    await Conversation.update({ updated_at: new Date() }, { where: { id: conversationId } });

    return chatMessage;
  }

  // Get conversations for organization
  async getConversationsByOrganization(
    organizationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Conversation[]> {
    return await Conversation.findAll({
      where: {
        organizationId: organizationId,
        is_active: true,
      },
      order: [['updated_at', 'DESC']],
      limit,
      offset,
    });
  }

  async getConversationsByCustomerId(customerId: string) {
    const conv = await Conversation.findOne({ where: { customerId: customerId } });
    return conv?.get({ plain: true });
  }

  // the section below is for storing and managing chat history and context meant for LLM consumption -----------------------------------

  async addChatbotMessage({ message, conversation_id, tokenCount }: AIChatMessageAttributes) {
    if (message) {
      await AiChatHistoryModel.create({
        conversation_id: conversation_id,
        chatContent: message,
        tokenCount: tokenCount,
      });

      const conversation = await Conversation.findByPk(conversation_id);
      if (conversation) {
        await conversation.update(
          { updated_at: new Date(), tokenCount: tokenCount + conversation.tokenCount },
          { where: { id: conversation_id } }
        );
      }
    }
  }

  async getMessagesForLLM(conversationId: string): Promise<any[]> {
    const [record, conversation] = await Promise.all([
      AiChatHistoryModel.findAll({ where: { conversation_id: conversationId } }),
      Conversation.findByPk(conversationId),
    ]);
    if (record.length === 0) return [];
    if (!conversation) throw new Error('Conversation not found');

    if (conversation.tokenCount <= this.config.maxContextTokens) {
      const messages = record.map((r) => r.chatContent && r.chatContent).flat();
      return messages;
    }

    // Summarize older messages
    // flatten all messages
    const messages = record.map((r) => r.chatContent).flat();
    console.log('📛========buildSummaryIncommingChatHistoryeRcord===============');
    console.log(messages);
    console.log('📛====================================');
    // get the last N messages
    let recentMessages = messages.slice(-this.config.keepRecentMessages);
    console.log('📛========buildSummaryIncommingeRcentMessages===============');
    console.log(recentMessages);
    console.log('📛====================================');
    // find call_ids that have both function_call and function_call_output
    const callIdsToKeep = messages
      .filter((m) => m?.call_id)
      .reduce((acc, curr, _, all) => {
        const hasPair = all.some(
          (x) =>
            x.call_id === curr.call_id &&
            x.type !== curr.type &&
            (x.type === 'function_call' || x.type === 'function_call_output')
        );

        if (hasPair && !acc.includes(curr.call_id)) {
          acc.push(curr.call_id);
        }
        return acc;
      }, []);

    console.log('📛========buildSummaryIncommingeCallIdsToKeep===============');
    console.log(callIdsToKeep);
    console.log('📛====================================');
    // filter to keep both recent and valid tool call pairs
    recentMessages = messages.filter((m, i) => {
      const inRecentWindow = i >= messages.length - this.config.keepRecentMessages;
      const isPairedCall = m?.call_id && callIdsToKeep.includes(m.call_id);
      return inRecentWindow || isPairedCall;
    });

    console.log('📛========buildSummaryIncommingeRcentMessagesAterTooFilter===============');
    console.log(recentMessages);
    console.log('📛====================================');
    // old messages are everything else
    const oldMessages = messages.filter((m) => !recentMessages.includes(m));
    console.log('📛========buildSummaryIncommingeCallIdsToKeep===============');
    console.log(oldMessages);
    console.log('📛====================================');
    // get ids of old messages for deletion
    const oldMessagesIds = record.filter((r) => oldMessages.includes(r.chatContent)).map((r) => r.id);

    const summaryPrompt = this.buildSummaryPrompt(oldMessages);
    const summaryMessage = await this.generateSummary(summaryPrompt); // returns { role: 'system', content: '...' }

    // Estimate token counts (use your tokenizer for accuracy)
    const recentTokens = record.reduce((sum, r) => sum + (r.tokenCount || 0), 0);
    const summaryTokens = this.estimateTokens(summaryMessage);
    const newTotalTokens = recentTokens + summaryTokens;

    // Persist: replace old messages with summary + recent
    const newChatContent = [{ role: 'assistant', content: summaryMessage }, ...recentMessages];

    await AiChatHistoryModel.destroy({
      where: {
        id: {
          [Op.in]: oldMessagesIds,
        },
      },
    });
    await AiChatHistoryModel.create({ chatContent: newChatContent, conversation_id: conversationId });
    await conversation.update({ tokenCount: newTotalTokens });
    return newChatContent;
  }

  private buildSummaryPrompt(messages: any[]): string {
    const conversationText = messages
      .map((msg) => {
        // 🔹 system / user / assistant messages
        if (msg.role) {
          if (Array.isArray(msg.content)) {
            const text = msg.content.map((c: any) => (typeof c === 'object' ? c.text || '' : c)).join(' ');
            return `${msg.role.toUpperCase()}: ${text}`;
          }
          return `${msg.role.toUpperCase()}: ${msg.content}`;
        }

        // 🔹 tool calls (no role)
        if (msg.type === 'function_call' || msg.type === 'tool_call') {
          return `TOOL CALL (${msg.name}): ${msg.arguments}`;
        }

        // 🔹 tool call output (after execution)
        if (msg.type === 'function_call_output' || msg.type === 'tool_call_output') {
          return `TOOL RESPONSE (${msg.name || msg.call_id}): ${msg.output || msg.result}`;
        }

        return '';
      })
      .join('\n\n');

    return `Please provide a concise summary of the following conversation, preserving key information, decisions, and context that would be important for continuing the dialogue, no follow up questions, do as instructed:
        ${conversationText}`;
  }

  private async generateSummary(prompt: string): Promise<string> {
    // Implement your LLM call here using OpenAI's API
    // For now, return a placeholder
    const OPENAI_API_KEY = appConfig.mcpKeys.openaiKey;
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const responses = await openai.responses.create({
      model: 'chatgpt-4o-latest',
      input: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return responses.output_text;
  }

  // Estimate tokens (using gpt-tokenizer)
  public estimateTokens(content: string): number {
    return encode(content).length;
  }
}

// add message with conv id, keep record of token count per conversation
// get messages by conv id, check token count, if > maxContextTokens, summarize
// store summary as system message, remove old messages, keep recent few messages
// retrieve messages for LLM input, include summary and recent messages
