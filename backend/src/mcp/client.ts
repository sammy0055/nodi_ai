import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import OpenAI from 'openai';
import { FunctionTool } from 'openai/resources/responses/responses';
import { appConfig } from '../config';

interface MCP_RESPONSE {
  content: {
    type: string;
    text: string;
  }[];
}

class UsageBase {}
export class MCPClient extends UsageBase {
  protected mcp: Client;
  public openai!: OpenAI;
  public transport: StdioClientTransport | null = null;
  protected tools: FunctionTool[] = [];

  llm_model = 'gpt-4.1-2025-04-14';
  maxIterations = 5;
  OPENAI_API_KEY = '';

  constructor() {
    super();
    this.mcp = new Client({
      name: 'credobyite',
      version: '1.0.0',
    });
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
  }

  protected async handleToolCall(conversationId: string, toolCall: any): Promise<void> {
    let args;
    try {
      args = JSON.parse(toolCall.arguments);
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
      toolResult = { content: [{ text: `Error: ${err.message}` }] };
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

  protected async query(label: string, systemPrompt: string) {
    // init a new conversation
    const conversation = await this.openai.conversations.create({
      items: [{ role: 'system', content: systemPrompt }],
    });

    let iteration = 0;
    let finalResponse = null;

    await this.openai.conversations.items.create(conversation.id, {
      items: [{ role: 'user', content: label }],
    });

    while (iteration < this.maxIterations) {
      const response = await this.openai.responses.create({
        model: this.llm_model,
        input: [
          {
            role: 'user',
            content: '', // empty content ➡️ forces model to continue
          },
        ],

        tools: this.tools,
        conversation: conversation.id, // OpenAI remembers everything
      });

      const toolCalls = response.output.filter((item) => item.type === 'function_call');

      if (toolCalls.length === 0) {
        finalResponse = response.output_text;
        break;
      }

      for (const toolCall of toolCalls) {
        await this.handleToolCall(conversation.id, toolCall);
      }

      iteration++;
    }

    return finalResponse;
  }

  async process(query: string, systemPrompt: string) {
    const res = await this.query(query, systemPrompt);
    // this.increaseCredits();
    return res;
  }
}

export class MCPChatBot extends MCPClient {
  constructor() {
    super();
  }

  public async connectToServer() {
    this.transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', 'src/mcp/server.ts', '--orgId=123org'],
      //   stderr: 'ignore',
    });

    try {
      await this.mcp.connect(this.transport);
      await super.connectToServer();
    } catch (error) {
      console.error('Failed to connect to MCP server: ', error);
      throw error;
    }
  }
}
