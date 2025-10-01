import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

// Find branches with product in customer's area
export const findBranchesWithProduct = (server: McpServer) => {
  return server.registerTool(
    'find_branches_with_product',
    {
      title: 'find_branches_with_product',
      description: "Find branches that have a specific product available in customer's area",
      inputSchema: {
        productId: z.string(),
        area: z.string().describe("Customer's area name"),
        includeTakeAway: z.boolean().default(true).optional(),
        includeDelivery: z.boolean().default(true).optional(),
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

// Check real-time availability
export const checkRealTimeAvailability = (server: McpServer) => {
  return server.registerTool(
    'check_availability',
    {
      title: 'check_availability',
      description: 'Check if product is available at specific branch with quantity',
      inputSchema: {
        productId: z.string(),
        branchId: z.string(),
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
