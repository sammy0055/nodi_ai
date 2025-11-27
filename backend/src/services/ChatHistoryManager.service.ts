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
import { calculateAndSubtractCredits } from '../helpers/billing-calcuations';
import { OrganizationsModel } from '../models/organizations.model';
import { CustomerModel } from '../models/customer.model';
import { createSystemPrompt } from '../mcp/prompts';
import { ItemDeleteParams } from 'openai/resources/conversations/items';

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
  async createConversation({
    organizationId,
    customerId,
    systemPrompt,
    title,
  }: CreateConversationProps): Promise<Conversation> {
    const openai = new OpenAI({ apiKey: appConfig.mcpKeys.openaiKey });
    const conversation = await openai.conversations.create(
      systemPrompt ? { items: [{ role: 'system', content: systemPrompt }] } : {}
    );
    const items = await openai.conversations.items.list(conversation.id);
    const systemMessage = items.data.find((i: any) => i.role === 'system');
    return await Conversation.create({
      id: conversation.id,
      organizationId: organizationId,
      customerId: customerId,
      title: title,
      systemMessageId: systemMessage?.id!,
    });
  }

  async summarizeConversationById(conversationId: string) {
    if (!conversationId) throw new Error('openai conversationId is required');

    const openai = new OpenAI({ apiKey: appConfig.mcpKeys.openaiKey });
    console.error('🏃🏼 processing chat summary', conversationId);

    const items = await openai.conversations.items.list(conversationId);

    const chatHistory = items.data
      .filter((item) => item.type === 'message')
      .filter((msg) => msg.role === 'user' || msg.role === 'assistant') // only the two we want
      .map((msg) => {
        const text = (msg.content || [])
          .filter((c) => c.type === 'input_text' || c.type === 'output_text')
          .map((c) => c.text)
          .join(' ')
          .trim();

        return { role: msg.role, content: text };
      })
      .filter((m) => m.content !== '');
    console.error('====================================');
    console.error('chatHistory', chatHistory);
    console.error('====================================');

    const response = await openai.responses.create({
      model: 'gpt-5',
      input: [
        { role: 'system', content: 'You are a helpful assistant that summarizes conversations very concisely.' },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `kindly provide a very short sammary for the chathistory below.\n chatHistory: ${JSON.stringify(chatHistory)}`,
            },
          ],
        },
      ],
    });

    console.error('✅ created summary successfully');
    return response.output_text;
  }

  async insertConversationSummary({
    summary,
    conversationId,
    organizationId,
    customerId,
  }: {
    summary: string;
    conversationId: string;
    organizationId: string;
    customerId: string;
  }) {
    const orgData = await OrganizationsModel.findByPk(organizationId);
    const customerData = await CustomerModel.findOne({ where: { organizationId: organizationId, id: customerId } });
    const systemPrompt = createSystemPrompt({
      organizationData: orgData!,
      customerData: customerData!,
      businessTone: 'formal',
      assistantName: orgData?.AIAssistantName || 'Alex',
    });
    const openai = new OpenAI({ apiKey: appConfig.mcpKeys.openaiKey });
    // get all items
    console.error('🏃🏼 processing chat summary insert', conversationId);
    const items = await openai.conversations.items.list(conversationId);
    for (const item of items.data) {
      // each item has its own id
      if (item.id) await openai.conversations.items.delete(conversationId, item.id as any);
    }

    await openai.conversations.items.create(conversationId, {
      items: [
        {
          type: 'message',
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: systemPrompt,
            },
          ],
        },
        {
          type: 'message',
          role: 'assistant',
          content: summary,
        },
      ],
    });
    console.error('✅ inserted summary and system prompt successfully');
  }

  // get conversations and update syetem prompt
  async deleteConversationItem({ msgId, conv }: { msgId: string; conv: ItemDeleteParams }) {
    const openai = new OpenAI({ apiKey: appConfig.mcpKeys.openaiKey });
    const conversation = await openai.conversations.items.delete(msgId, conv);
    return conversation;
  }

  async insertConverationItem(convId: string, item: string) {
    const openai = new OpenAI({ apiKey: appConfig.mcpKeys.openaiKey });
    await openai.conversations.items.create(convId, {
      items: [
        {
          type: 'message',
          role: 'system',
          content: item,
        },
      ],
    });
  }

  // Add a message with proper OpenAI structure
  async addMessage(
    { conversationId, organizationId }: { conversationId: string; organizationId: string },
    message: {
      role: OpenAIRole;
      content: string | null;
      token?: number;
    }
  ): Promise<ChatMessage> {
    // Get current max message index
    const maxIndex =
      ((await ChatMessage.max('message_index', {
        where: { conversation_id: conversationId },
      })) as number) || -1;

    const messageIndex = maxIndex + 1;

    const chatMessage = await ChatMessage.create({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      token: message.token || 0,
      message_index: messageIndex,
    });

    // creditcheck
    await calculateAndSubtractCredits(
      { aiTokensUsed: message.token || 0 },
      { organizationId: organizationId, conversationId: conversationId }
    );

    // Update conversation timestamp
    if (message.token && message.token !== 0) {
      await Conversation.increment({ tokenCount: message.token || 0 }, { where: { id: conversationId } });
    }
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

  async getConversationsByCustomerId(customerId: string, organizationId: string) {
    const conv = await Conversation.findOne({ where: { customerId: customerId, organizationId: organizationId } });
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
