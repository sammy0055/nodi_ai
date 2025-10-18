import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { models } from '../../../models';

const { ReviewModel } = models;

export const createReview = (server: McpServer) => {
  return server.registerTool(
    'create_review',
    {
      title: 'create_review',
      description: 'create a review for an order',
      inputSchema: {
        organizationId: z.string().describe('the id of the organization'),
        customerId: z.string().describe('the customers unique ID'),
        orderId: z.string().describe('the order unique ID'),
        rating: z.number().min(1).max(5).describe('the rating for the order'),
        comment: z.string().optional().describe('the comment for the review'),
      },
    },
    async (param) => {
      try {
        await ReviewModel.create(param);
        return {
          content: [{ type: 'text', text: 'Review created successfully' }],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR-CREATE-REVIEW:${error.message}`);
        return {
          content: [{ type: 'text', text: 'Failed to create review' }],
        };
      }
    }
  );
};
