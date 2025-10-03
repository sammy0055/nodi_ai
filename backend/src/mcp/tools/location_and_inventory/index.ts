import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ManageVectorStore } from '../../../helpers/vector-store';
import { IArea } from '../../../types/area';
import { BranchesModel } from '../../../models/branches.model';
import { Op } from 'sequelize';
import { BranchInventoryModel } from '../../../models/branch-inventory.model';
import { ProductModel } from '../../../models/products.model';

// Find branches with product in customer's area
export const findBranchesWithProduct = (server: McpServer) => {
  return server.registerTool(
    'find_branches_with_product',
    {
      title: 'find_branches_with_product',
      description: "Find branches that have a specific product available in customer's area",
      inputSchema: {
        organizationId: z.string(),
        productId: z.string(),
        area: z.string().describe("Customer's area name"),
        includeTakeAway: z.boolean().default(true).optional(),
        includeDelivery: z.boolean().default(true).optional(),
      },
    },
    async (params) => {
      const vectorStore = new ManageVectorStore();

      try {
        if (params.area) {
          const areas: IArea[] = (await vectorStore.searchAreas({
            query: params.area,
            organizationId: params.organizationId,
          })) as any;
          if (areas && areas.length !== 0) {
            const branches = areas.map((area) => area?.branchId);
            const productInventory = await BranchInventoryModel.findAll({
              where: {
                organizationId: params.organizationId,
                productId: params.productId,
                branchId: {
                  [Op.in]: branches.filter(Boolean), // removes undefined/null
                },
              },
              include: [
                { model: ProductModel, as: 'product' },
                { model: BranchesModel, as: 'branch' },
              ],
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(productInventory),
                  mimeType: 'application/json',
                },
              ],
            };
          }
        }

        const productwithBranches = await BranchInventoryModel.findAll({
          where: { productId: params.productId, organizationId: params.organizationId },
          include: [
            { model: ProductModel, as: 'product' },
            { model: BranchesModel, as: 'branch' },
          ],
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(productwithBranches),
              mimeType: 'application/json',
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to find branches that have a specific product available in customer's area`,
            },
          ],
        };
      }
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
        organizationId: z.string(),
        productId: z.string(),
        branchId: z.string(),
      },
    },
    async (params) => {
      try {
        const productwithBranches = await BranchInventoryModel.findAll({
          where: { productId: params.productId, organizationId: params.organizationId },
          include: [
            { model: ProductModel, as: 'product' },
            { model: BranchesModel, as: 'branch' },
          ],
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(productwithBranches),
              mimeType: 'application/json',
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: 'Failed to find products available at specific branch with quantity' }],
        };
      }
    }
  );
};
