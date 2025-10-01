import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

// Search products across organization
export const searchProducts = (server: McpServer) => {
  return server.registerTool(
    'search_products',
    {
      title: 'search_products',
      description: 'Search for products by name, description, or keywords',
      inputSchema: {
        query: z.string().describe('Search query').optional(),
        maxResults: z.number().default(10).optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        area: z.string().describe("Customer's area for location-based search").optional(),
      },
    },
    async (params) => {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: product catalog is empty',
          },
        ],
      };
    }
  );
};

// Get product with inventory availability
export const getProductWithAvailability = (server: McpServer) => {
  return server.registerTool(
    'get_product_availability',
    {
      title: 'get_product_availability',
      description: 'Get product details with real-time inventory availability across branches',
      inputSchema: {
        productId: z.string(),
        area: z.string().describe("Customer's area to find nearest branches").optional(),
      },
    },
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: product catalog is empty',
          },
        ],
      };
    }
  );
};
