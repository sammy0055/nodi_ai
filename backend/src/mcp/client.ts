import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import OpenAI from 'openai';
import { FunctionTool } from 'openai/resources/responses/responses';
import { appConfig } from '../config';
import { ChatHistoryManager } from '../services/ChatHistoryManager.service';

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

  llm_model = 'gpt-4.1-2025-04-14';
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
      this.llm_model = mcpDetails.model;
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
    console.log('==============testing double======================');
    console.log("testing double");
    console.log('=================testing double===================');
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
    } catch {
      await this.chatHistory.addChatbotMessage({
        conversation_id: conversationId,
        message: {
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: JSON.stringify({ error: 'Invalid JSON arguments' }),
        },
        tokenCount: 0,
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
      await this.chatHistory.addChatbotMessage({
        conversation_id: conversationId,
        message: {
          type: toolCall.type,
          name: toolCall.name,
          call_id: toolCall.call_id,
          arguments: toolCall.arguments,
        },
        tokenCount: 0,
      });
      console.log('====================================');
      console.log(
        'Tool execution successfull: ',
        `toolName:${toolCall.name}, ToolResult: ${JSON.stringify(toolResult, null, 2)}`
      );
      console.log('====================================');
    } catch (err: any) {
      await this.chatHistory.addChatbotMessage({
        conversation_id: conversationId,
        message: {
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: JSON.stringify({
            error: `Tool execution failed: ${err.message}`,
          }),
        },
        tokenCount: 0,
      });

      return;
    }

    const toolResultContent = toolResult.content.map((i) => i.text);

    // feed tool result back into conversation
    await this.chatHistory.addChatbotMessage({
      conversation_id: conversationId,
      message: {
        type: 'function_call_output',
        call_id: toolCall.call_id,
        output: JSON.stringify(toolResultContent),
      },
      tokenCount: 0,
    });
  }

  protected async query({ query, organizationId, conversationId, customerId, systemPrompt }: ProcessQueryTypes) {
    // init a new conversation
    let currentConversationId = conversationId;

    // Add user message to history
    await this.chatHistory.addChatbotMessage({
      conversation_id: conversationId,
      message: { role: 'user', content: query },
      tokenCount: this.chatHistory.estimateTokens(query + systemPrompt),
    });
    await this.chatHistory.addMessage(conversationId, { role: 'user', content: query });
    let iteration = 0;
    let finalResponse = '';
    let totalTokenUsed = 0;

    while (iteration < this.maxIterations) {
      const history = await this.chatHistory.getMessagesForLLM(conversationId);
      console.log('=============history===============');
      console.log(JSON.stringify(history, null, 2));
      console.log('====================================');
      const response = await this.openai.responses.create({
        model: this.llm_model,
        input: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: query }],

        tools: this.tools,
      });

      const toolCalls = response.output.filter((item) => item.type === 'function_call');

      if (toolCalls.length === 0) {
        totalTokenUsed = response.usage?.total_tokens || 0;
        finalResponse = response.output_text;
        break;
      }

      for (const toolCall of toolCalls) {
        await this.handleToolCall({ conversationId: currentConversationId, organizationId, toolCall, customerId });
        // Add delay between calls (e.g., 1 second)
        await new Promise((r) => setTimeout(r, 1000));
      }

      iteration++;
    }
    await this.chatHistory.addChatbotMessage({
      conversation_id: conversationId,
      message: { role: 'assistant', content: finalResponse },
      tokenCount: totalTokenUsed,
    });
    await this.chatHistory.addMessage(conversationId, { role: 'assistant', content: finalResponse });
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

  public async connectToMcpServer() {
    this.transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', 'src/mcp/server.ts'],
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
