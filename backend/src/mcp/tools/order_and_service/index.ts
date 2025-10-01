import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

// Create order with inventory check
export const createOrder = (server: McpServer) => {
  return server.registerTool(
    'create_order',
    {
      title: 'create_order',
      description: 'Create an order with inventory reservation',
      inputSchema: {
        branchId: z.string(),
        deliveryArea: z.string().optional(),
        serviceType: z.enum(['delivery', 'takeaway']).optional(),
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number(),
            options: z.array(
              z.object({
                items: z.string(),
              })
            ),
          })
        ),
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

export const getBranchInfo = (server: McpServer) => {
  return server.registerTool(
    'get_branch_info',
    {
      title: 'get_branch_info',
      description: 'Get comprehensive branch information including services and delivery areas',
      inputSchema: {
        branchId: z.string().optional(),
        area: z.string().describe('Filter by area if needed').optional(),
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
