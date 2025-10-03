import { MCPChatBot } from '../mcp/client';
import { run } from './migration';
const testMcp = async (query: string) => {
  const client = new MCPChatBot();
  try {
    const organizationId = '';
    await client.connectToServer();
    const result = await client.process(query, organizationId, '');
    console.log('=========mcp-client-results=============');
    console.log(result);
    console.log('====================================');
  } catch (error: any) {
    console.log('===========mcp-client-error==========');
    console.log(error);
    console.log('====================================');
  }
};

// testMcp('hello');
// run();
