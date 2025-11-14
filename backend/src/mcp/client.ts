import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import OpenAI from 'openai';
import { FunctionTool } from 'openai/resources/responses/responses';
import { appConfig } from '../config';
import { ChatHistoryManager } from '../services/ChatHistoryManager.service';

import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const structuredResponseFormat = z.object({
  data: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('message'),
      response: z.string(),
    }),

    z.object({
      type: z.literal('catalog'),
      catalogUrl: z.string(),
      productUrl: z.string(),
    }),

    z.object({
      type: z.literal('flow'),
      zones: z.array(z.object({ id: z.string(), title: z.string() })),
    }),
  ]),
});

interface MCP_RESPONSE {
  content: {
    type: string;
    text: string;
  }[];
}

interface HandleToolCallParams {
  conversationId: string;
  organizationId: string;
  customerId: string;
  toolCall: any;
}

class UsageBase {}
export class MCPClient extends UsageBase {
  protected mcp: Client;
  public openai!: OpenAI;
  public transport: StdioClientTransport | null = null;
  protected tools: FunctionTool[] = [];
  private chatHistory: ChatHistoryManager;

  llm_model = 'gpt-4.1-mini';
  maxIterations = 5;
  OPENAI_API_KEY = '';

  constructor() {
    super();
    this.mcp = new Client({
      name: 'credobyite',
      version: '1.0.0',
    });
    this.chatHistory = new ChatHistoryManager();
  }

  protected async connectToServer() {
    const mcpDetails = appConfig.mcpKeys;
    if (mcpDetails) {
      this.OPENAI_API_KEY = mcpDetails.openaiKey;
    }

    this.openai = new OpenAI({ apiKey: this.OPENAI_API_KEY });
    await this.initTools();
  }

  protected async initTools() {
    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map((tool) => {
      return {
        type: 'function',
        description: tool.description,
        name: tool.name,
        parameters: tool.inputSchema,
        strict: false,
      };
    });
    console.log(
      'Connected to server with tools:',
      this.tools.map(({ name }) => name)
    );
  }

  protected async handleToolCall({
    toolCall,
    conversationId,
    organizationId,
    customerId,
  }: HandleToolCallParams): Promise<void> {
    let args;
    try {
      args = JSON.parse(toolCall.arguments);
      args.organizationId = organizationId;
      args.customerId = customerId;
      args.conversationId = conversationId;
    } catch {
      await this.openai.conversations.items.create(conversationId, {
        items: [
          {
            type: 'function_call_output',
            call_id: toolCall.call_id,
            output: JSON.stringify({ error: 'Invalid JSON arguments' }),
          },
        ],
      });
      return;
    }

    let toolResult;
    try {
      console.log('====================================');
      console.log(`Calling tool: ${toolCall.name}, args: ${JSON.stringify(args, null, 2)}`);
      console.log('====================================');
      toolResult = (await this.mcp.callTool({
        name: toolCall.name,
        arguments: args,
      })) as MCP_RESPONSE;

      console.log('====================================');
      console.log(
        'Tool execution successfull: ',
        `toolName:${toolCall.name}, ToolResult: ${JSON.stringify(toolResult, null, 2)}`
      );
      console.log('====================================');
    } catch (err: any) {
      await this.openai.conversations.items.create(conversationId, {
        items: [
          {
            type: 'function_call_output',
            call_id: toolCall.call_id,
            output: JSON.stringify({
              error: `Tool execution failed: ${err.message}`,
            }),
          },
        ],
      });

      return;
    }

    const toolResultContent = toolResult.content.map((i) => i.text);

    // feed tool result back into conversation
    await this.openai.conversations.items.create(conversationId, {
      items: [
        {
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: JSON.stringify(toolResultContent),
        },
      ],
    });
  }

  protected async query({ query, organizationId, conversationId, customerId, systemPrompt }: ProcessQueryTypes) {
    // init a new conversation
    let currentConversationId = conversationId;

    // Add user message to history
    await this.openai.conversations.items.create(conversationId, {
      items: [
        // ...(systemPrompt?.trim() && ([{ role: 'system', content: systemPrompt }] as any)),
        { role: 'user', content: query },
      ],
    });
    await this.chatHistory.addMessage({ conversationId, organizationId }, { role: 'user', content: query });
    let iteration = 0;
    let finalResponse: any = '';
    let totalTokenUsed = 0;

    while (iteration < this.maxIterations) {
      const response = await this.openai.responses.parse({
        model: this.llm_model,
        input: [
          {
            role: 'user',
            content: '', // empty content ➡️ forces model to continue
          },
        ],

        tools: this.tools,
        conversation: conversationId, // OpenAI remembers everything
        truncation: 'auto',
        text: {
          format: zodTextFormat(structuredResponseFormat, 'structured_response_extraction'),
        },
      });

      const toolCalls = response.output.filter((item) => item.type === 'function_call');

      if (toolCalls.length === 0) {
        totalTokenUsed = response.usage?.total_tokens || 0;
        finalResponse = response.output_parsed;
        break;
      }

      for (const toolCall of toolCalls) {
        await this.handleToolCall({ conversationId: currentConversationId, organizationId, toolCall, customerId });
        // Add delay between calls (e.g., 1 second)
        await new Promise((r) => setTimeout(r, 1000));
      }

      iteration++;
    }

    await this.chatHistory.addMessage(
      { conversationId, organizationId },
      {
        role: 'assistant',
        content: JSON.stringify(finalResponse),
        token: totalTokenUsed,
      }
    );
    return finalResponse;
  }

  async process({ query, organizationId, customerId, conversationId, systemPrompt }: ProcessQueryTypes) {
    const res = await this.query({ query, organizationId, customerId, conversationId, systemPrompt });
    // this.increaseCredits();
    return res;
  }
}

export class MCPChatBot extends MCPClient {
  constructor() {
    super();
  }

  public async connectToMcpServer(conversationId: string) {
    this.transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', 'src/mcp/server.ts'],
      env: {
        conversationId: conversationId,
      },
    });

    try {
      await this.mcp.connect(this.transport);
      await this.connectToServer();
    } catch (error) {
      console.error('Failed to connect to MCP server: ', error);
      throw error;
    }
  }
}

interface ProcessQueryTypes {
  query: string;
  systemPrompt: string;
  organizationId: string;
  conversationId: string;
  customerId: string;
}
