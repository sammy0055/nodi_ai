// services/ChatHistoryManager.ts

import OpenAI from 'openai';
import { ChatMessage } from '../models/chat-messages.model';
import { Conversation } from '../models/conversation.model';
import { ChatCompletionMessageParam, OpenAIToolCall, OpenAIRole, OpenAIToolResult } from '../types/chat';
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
  message: any[] | string;
  conversation_id: string;
  tokenCount: number;
}

export class ChatHistoryManager {
  private config: ChatHistoryConfig;

  constructor(config: Partial<ChatHistoryConfig> = {}) {
    this.config = {
      maxContextTokens: 8000,
      compressionThreshold: 6000,
      keepRecentMessages: 5,
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
        chatContent: typeof message === 'string' ? [message] : message,
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
      return record.map((r) => r.chatContent).flat();
    }

    // Summarize older messages
    const messages = record.map((r) => r.chatContent).flat();
    const recentMessages = messages.slice(-this.config.keepRecentMessages);
    const oldMessages = messages.slice(0, -this.config.keepRecentMessages);
    const oldMessagesIds = record.slice(0, -this.config.keepRecentMessages).map((r) => r.id);
    // Estimate tokens of recent messages (or track per-message tokens if needed)
    // For simplicity, assume summarization reduces old messages to ~200 tokens
    const summaryPrompt = this.buildSummaryPrompt(oldMessages);
    const summaryMessage = await this.generateSummary(summaryPrompt); // returns { role: 'system', content: '...' }

    // Estimate token counts (use your tokenizer for accuracy)
    const recentTokens = record.reduce((sum, r) => sum + (r.tokenCount || 0), 0);
    const summaryTokens = this.estimateTokens(summaryMessage);
    const newTotalTokens = recentTokens + summaryTokens;

    // Persist: replace old messages with summary + recent
    const newChatContent = [summaryMessage, ...recentMessages];

    await Promise.all([
      AiChatHistoryModel.destroy({
        where: {
          id: {
            [Op.in]: oldMessagesIds,
          },
        },
      }),
      AiChatHistoryModel.create({ chatContent: newChatContent, conversation_id: conversationId }),
      conversation.update({ tokenCount: newTotalTokens }),
    ]);
    return newChatContent;
  }

  private buildSummaryPrompt(messages: any[]): string {
    const conversationText = messages;

    return `Please provide a concise summary of the following conversation, preserving key information, decisions, and context that would be important for continuing the dialogue:
        ${conversationText} Summary:`;
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
