// services/ChatHistoryManager.ts

import OpenAI from 'openai';
import { ChatMessage } from '../models/chat-messages.model';
import { Conversation } from '../models/conversation.model';
import { ChatCompletionMessageParam, StoredMessage, OpenAIToolCall, OpenAIRole, OpenAIToolResult } from '../types/chat';
import { encode } from 'gpt-tokenizer';
import { appConfig } from '../config';

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
    return await Conversation.create({
      id: conversation.id,
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

  // Get messages formatted for OpenAI API
  private async getMessagesForOpenAI(conversationId: string): Promise<ChatCompletionMessageParam[]> {
    const messages = await this.getFullMessageHistory(conversationId);

    const totalTokens = messages.reduce((sum, msg) => sum + msg.tokens, 0);

    if (totalTokens > this.config.compressionThreshold) {
      return await this.getCompressedMessages(conversationId, messages);
    }

    return this.formatForOpenAI(messages);
  }

  // Get full message history for frontend
  private async getFullMessageHistory(conversationId: string): Promise<StoredMessage[]> {
    const messages = await ChatMessage.findAll({
      where: { conversation_id: conversationId },
      order: [['message_index', 'ASC']],
      raw: true,
    });

    return messages.map((msg) => this.mapToStoredMessage(msg));
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

  // Get complete conversation with messages
  private async getConversationWithMessages(conversationId: string): Promise<{
    conversation: Conversation;
    messages: StoredMessage[];
  }> {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = await this.getFullMessageHistory(conversationId);

    return {
      conversation,
      messages,
    };
  }

  // Compress messages when context gets too long
  private async getCompressedMessages(
    conversationId: string,
    messages: StoredMessage[]
  ): Promise<ChatCompletionMessageParam[]> {
    const recentMessages = messages.slice(-this.config.keepRecentMessages);
    const olderMessages = messages.slice(0, -this.config.keepRecentMessages);

    if (olderMessages.length === 0) {
      return this.formatForOpenAI(recentMessages);
    }

    // Create compression summary
    const compressionResult = await this.createCompressionSummary(conversationId, olderMessages);

    // Combine compressed summary with recent messages
    return [
      {
        role: 'system',
        content: compressionResult.summary,
      },
      ...this.formatForOpenAI(recentMessages),
    ];
  }

  // Create summary of older messages
  private async createCompressionSummary(
    conversationId: string,
    messages: StoredMessage[]
  ): Promise<{ summary: string; compressedMessageId: string }> {
    const summaryPrompt = this.buildSummaryPrompt(messages);
    const summary = await this.generateSummary(summaryPrompt);

    const compressedFrom = messages.map((m) => m.id).filter(Boolean) as string[];

    const compressedMessage = await ChatMessage.create({
      conversation_id: conversationId,
      role: 'system',
      content: summary,
      message_index: messages[0].message_index,
      is_compressed: true,
      compressed_from: compressedFrom,
      tokens: this.estimateTokens(summary),
    });

    return {
      summary: `Previous conversation summary: ${summary}`,
      compressedMessageId: compressedMessage.id,
    };
  }

  private buildSummaryPrompt(messages: StoredMessage[]): string {
    const conversationText = messages
      .map((msg) => {
        const role = msg.role.toUpperCase();
        const content = msg.content || '';
        let toolInfo = '';

        if (msg.tool_calls && msg.tool_calls.length > 0) {
          toolInfo = `\nTools called: ${msg.tool_calls
            .map((tc: OpenAIToolCall) => `${tc.function.name}(${tc.function.arguments})`)
            .join(', ')}`;
        }

        if (msg.tool_results) {
          toolInfo += `\nTool results: ${JSON.stringify(msg.tool_results)}`;
        }

        return `${role}: ${content}${toolInfo}`;
      })
      .join('\n\n');

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

  // Format messages for OpenAI API
  private formatForOpenAI(messages: StoredMessage[]): ChatCompletionMessageParam[] {
    return messages.map((msg) => {
      const openAIMessage: ChatCompletionMessageParam = {
        role: msg.role,
        content: msg.content,
      };

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        openAIMessage.tool_calls = msg.tool_calls;
      }

      if (msg.tool_call_id) {
        openAIMessage.tool_call_id = msg.tool_call_id;
      }

      if (msg.role === 'tool') {
        openAIMessage.name = msg.tool_call_id;
      }

      return openAIMessage;
    });
  }

  private mapToStoredMessage(chatMessage: ChatMessage): StoredMessage {
    return {
      id: chatMessage.id,
      role: chatMessage.role,
      content: chatMessage.content,
      tool_calls: chatMessage.tool_calls,
      tool_call_id: chatMessage.tool_call_id,
      tool_results: chatMessage.tool_results,
      tokens: chatMessage.tokens,
      message_index: chatMessage.message_index,
      is_compressed: chatMessage.is_compressed,
      created_at: chatMessage.created_at,
    };
  }

  // Estimate tokens (using gpt-tokenizer)
  private estimateTokens(content: string): number {
    return encode(content).length;
  }

  // Utility to handle tool calls and responses
  private async addToolCall(
    conversationId: string,
    assistantMessage: string | null,
    toolCalls: OpenAIToolCall[]
  ): Promise<ChatMessage> {
    return await this.addMessage(conversationId, {
      role: 'assistant',
      content: assistantMessage,
      tool_calls: toolCalls,
    });
  }

  private async addToolResponse(
    conversationId: string,
    toolCallId: string,
    result: any,
    content?: string
  ): Promise<ChatMessage> {
    return await this.addMessage(conversationId, {
      role: 'assistant',
      content: content || JSON.stringify(result),
      tool_call_id: toolCallId,
      tool_results: result,
    });
  }
}
