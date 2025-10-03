import { z } from 'zod';
import { Op } from 'sequelize';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ManageVectorStore } from '../../../helpers/vector-store';
import { IArea } from '../../../types/area';
import { BranchInventoryModel } from '../../../models/branch-inventory.model';
import { ProductModel } from '../../../models/products.model';

// Product recommendations with availability
export const getRecommendations = (server: McpServer) => {
  return server.registerTool(
    'get_recommendations',
    {
      title: 'get_recommendations',
      description: 'Get recommended products based on search, with availability status',
      inputSchema: {
        organizationId: z.string(),
        query: z.string().describe("Customer's interest or search term").optional(),
        area: z.string().describe("Customer's area").optional(),
        maxResults: z.number().default(5),
      },
    },
    async (params) => {
      const vectorStore = new ManageVectorStore();
      let areas: IArea[] = [];
      try {
        const products = (await vectorStore.searchProducts({
          ...(params.query && { query: params.query }),
          organizationId: params.organizationId,
          limit: params.maxResults,
        })) as any;
        if (params.area) {
          areas = (await vectorStore.searchAreas({
            organizationId: params.organizationId,
            query: params.area,
            limit: params.maxResults,
          })) as any;
        }
        const branchIds = areas.map((area) => area.branchId);
        const productIds = products.map((p: any) => p?.id);
        const availableProductsInBranch = await BranchInventoryModel.findAll({
          where: {
            branchId: {
              [Op.in]: branchIds.filter(Boolean),
            },
            productId: {
              [Op.in]: productIds.filter(Boolean),
            },
            quantityOnHand: {
              [Op.gt]: 0,
            },
          },
          limit: params.maxResults,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(availableProductsInBranch),
              mimeType: 'application/json',
            },
          ],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR: ${error.message}`);
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get products based on search, with availability status`,
            },
          ],
        };
      }
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
        organizationId: z.string(),
        productId: z.string().describe("Original product that's unavailable"),
        area: z.string().describe("Customer's area"),
      },
    },
    async (params) => {
      const vectorStore = new ManageVectorStore();
      let areas: IArea[] = [];
      try {
        const product = await ProductModel.findByPk(params.productId);
        if (!product) {
          return { content: [{ type: 'text', text: 'this product does not exist' }] };
        }
        const text = `productName:${product.name} description: ${product.description}`;
        const similarProducts = await vectorStore.searchProducts({
          query: text,
          organizationId: params.organizationId,
        });
        if (params.area) {
          areas = (await vectorStore.searchAreas({ query: params.area, organizationId: params.organizationId })) as any;
        }
        const branchIds = areas.map((area) => area.branchId);
        const productIds = similarProducts.map((p: any) => p?.id);
        const availableProductsInBranch = await BranchInventoryModel.findAll({
          where: {
            branchId: {
              [Op.in]: branchIds.filter(Boolean),
            },
            productId: {
              [Op.in]: productIds.filter(Boolean),
            },
            quantityOnHand: {
              [Op.gt]: 0,
            },
          },
          limit: 10,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(availableProductsInBranch),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get alternative products`,
            },
          ],
        };
      }
    }
  );
};
