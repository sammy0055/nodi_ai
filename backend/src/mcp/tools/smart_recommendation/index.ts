import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

// Product recommendations with availability
export const getRecommendations = (server: McpServer) => {
  return server.registerTool(
    'get_recommendations',
    {
      title: 'get_recommendations',
      description: 'Get recommended products based on search, with availability status',
      inputSchema: {
        query: z.string().describe("Customer's interest or search term").optional(),
        area: z.string().describe("Customer's area").optional(),
        maxResults: z.number().default(5),
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

// Alternative products when out of stock
export const suggestAlternatives = (server: McpServer) => {
  return server.registerTool(
    'suggest_alternatives',
    {
      title: 'suggest_alternatives',
      description: 'Suggest alternative products when requested product is unavailable',
      inputSchema: {
        productId: z.string().describe("Original product that's unavailable"),
        area: z.string().describe("Customer's area"),
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
