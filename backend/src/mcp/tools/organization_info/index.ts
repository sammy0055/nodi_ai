import { models } from '../../../models';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

const { OrganizationsModel } = models;

export const getOrgFrequentlyAskedQuestion = (server: McpServer) => {
  return server.registerTool(
    'get_frequently_ask_questions',
    {
      title: 'Fetch Organization FAQ',
      description: 'Retrieves the most frequently asked questions for a specific organization or business.',
      inputSchema: {
        organizationId: z.string(),
      },
    },
    async (params) => {
      try {
        const org = await OrganizationsModel.findByPk(params.organizationId);
        if (!org) {
          return {
            content: [{ type: 'text', text: 'Failed to fetch Organization FAQ' }],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(org), mimeType: 'application/json' }],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR:${error.message}`);
        return {
          content: [{ type: 'text', text: 'Failed to fetch Organization FAQ' }],
        };
      }
    }
  );
};
