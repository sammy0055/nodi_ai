import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ManageVectorStore } from '../../../helpers/vector-store';
import { BranchInventoryModel } from '../../../models/branch-inventory.model';
import { Op } from 'sequelize';
import { ProductModel } from '../../../models/products.model';
import { BranchesModel } from '../../../models/branches.model';

// Search products across organization
export const searchProducts = (server: McpServer) => {
  return server.registerTool(
    'search_products',
    {
      title: 'search_products',
      description: 'Search for products by name, description, or keywords',
      inputSchema: {
        organizationId: z.string(),
        query: z.string().describe('Search query').optional(),
        maxResults: z.number().default(10).optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        area: z.string().describe("Customer's area for location-based search").optional(),
      },
    },
    async ({ query, organizationId, maxResults }) => {
      const vectorStore = new ManageVectorStore();
      try {
        const products = await vectorStore.searchProducts({
          query: query,
          organizationId: organizationId,
          limit: maxResults || 10,
        });

        if (!products)
          return {
            content: [
              {
                type: 'text',
                text: 'not product found',
              },
            ],
          };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(products),
              mimeType: 'application/json',
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: 'Failed to get products' }],
        };
      }
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
        organizationId: z.string(),
        productId: z.string(),
        area: z.string().describe("Customer's area to find nearest branches").optional(),
      },
    },
    async (params) => {
      const vectorStore = new ManageVectorStore();
      try {
        const areas = await vectorStore.searchAreas({
          query: params.area || '',
          organizationId: params.organizationId,
          limit: 15,
        });

        if (!areas) {
          return { content: [{ type: 'text', text: 'no branch found within area' }] };
        }

        const branches = areas.map((area) => area?.branchId);
        const productsInBranches = await BranchInventoryModel.findAll({
          where: {
            organizationId: params.organizationId,
            branchId: {
              [Op.in]: branches.filter(Boolean), // removes undefined/null
            },
          } as any,
          include: [
            {
              model: ProductModel,
              as: 'product',
            },
            {
              model: BranchesModel,
              as: 'branch',
            },
          ],
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(productsInBranches),
              mimeType: 'application/json',
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: 'Failed to get product details with real-time inventory availability across branches',
            },
          ],
        };
      }
    }
  );
};
