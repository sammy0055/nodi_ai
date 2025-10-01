import { MCPChatBot } from '../mcp/client';
const testMcp = async (query: string) => {
  const client = new MCPChatBot();
  try {
    await client.connectToServer();
    const result = await client.process(query, '');
    console.log('=========mcp-client-results=============');
    console.log(result);
    console.log('====================================');
  } catch (error: any) {
    console.log('===========mcp-client-error==========');
    console.log(error);
    console.log('====================================');
  }
};

testMcp('hello');
