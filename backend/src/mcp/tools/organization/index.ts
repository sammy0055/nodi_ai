import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import z from 'zod';
import { models } from '../../../models';

const { OrganizationsModel } = models;

export const getOrganizationHotline = (server: McpServer) => {
  return server.registerTool(
    'get_organization_hotline',
    {
      title: 'Get Organization Hotline',
      description: 'get the organization hotline',
      inputSchema: {
        organizationId: z.string().describe('the id of the organization'),
      },
    },
    async ({ organizationId }) => {
      try {
        const org = await OrganizationsModel.findByPk(organizationId);

        if (!org?.hotline) {
          return {
            content: [{ type: 'text', text: `no hotline was found for this organization` }],
          };
        }
        return {
          content: [{ type: 'text', text: `organization hotline is ${org.hotline}` }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Failed to get organization hotline` }],
        };
      }
    }
  );
};
