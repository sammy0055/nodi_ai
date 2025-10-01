import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

// Get delivery options for area
export const getDeliveryOptions = (server: McpServer) => {
  return server.registerTool(
    'get_delivery_options',
    {
      title: 'get_delivery_options',
      description: "Get available delivery options for customer's area",
      inputSchema: {
        area: z.string().describe("Customer's area"),
        branchId: z.string().describe('Optional specific branch').optional(),
      },
    },
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: '',
          },
        ],
      };
    }
  );
};

// Calculate delivery cost and time
export const calculateDelivery = (server: McpServer) => {
  return server.registerTool(
    'calculate_delivery',
    {
      title: 'calculate_delivery',
      description: 'Calculate delivery time and cost for specific area and branch',
      inputSchema: {
        area: z.string(),
        branchId: z.string(),
        zone: z.string(),
      },
    },
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: '',
          },
        ],
      };
    }
  );
};
