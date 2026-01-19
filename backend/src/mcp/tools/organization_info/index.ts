import { models } from '../../../models';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { checkBusinessServiceSchedule } from '../../../utils/organization';

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

export const checkBusinessServiceAvailability = (server: McpServer) => {
  return server.registerTool(
    'check_business_service_schedule',
    {
      title: 'Check Business Service Availability',
      description:
        'Determines whether a business service is currently open or closed based on its regular weekly schedule and any special date overrides (e.g., holidays or special hours). Returns real-time availability using the configured timezone.',
      inputSchema: {
        organizationId: z.string(),
      },
    },

    async (params) => {
      try {
        const org = await OrganizationsModel.findByPk(params.organizationId);
        if (!org) {
          return {
            content: [{ type: 'text', text: 'Failed to fetch Organization Service Schedule' }],
          };
        }

        const schedule = checkBusinessServiceSchedule(org.serviceSchedule);
        return {
          content: [{ type: 'text', text: JSON.stringify(schedule) }],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR:${error.message}`);
        return {
          content: [{ type: 'text', text: 'Failed to fetch Organization Service Schedule' }],
        };
      }
    }
  );
};
