import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ManageVectorStore } from '../../../helpers/vector-store';
import { IArea } from '../../../types/area';
import { BranchesModel } from '../../../models/branches.model';
import { literal, Op } from 'sequelize';
import { models } from '../../../models';

const { ProductModel, BranchInventoryModel } = models;

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
        const areas: IArea[] = (await vectorStore.searchAreas({
          query: params.area,
          organizationId: params.organizationId,
        })) as any;
        if (areas && areas.length === 0) {
          return { content: [{ type: 'text', text: 'This product is not available in your area' }] };
        }
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

        // const productwithBranches = await BranchInventoryModel.findAll({
        //   where: { productId: params.productId, organizationId: params.organizationId },
        //   include: [
        //     { model: ProductModel, as: 'product' },
        //     { model: BranchesModel, as: 'branch' },
        //   ],
        // });

        // return {
        //   content: [
        //     {
        //       type: 'text',
        //       text: JSON.stringify(productwithBranches),
        //       mimeType: 'application/json',
        //     },
        //   ],
        // };
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

// export const updateInventory = (server: McpServer) => {
//   return server.registerTool(
//     'adjust_branch_stock',
//     {
//       title: 'Adjust Branch Stock',
//       description: 'Update a branch’s inventory by deducting quantities of ordered products.',
//       inputSchema: {
//         organizationId: z.string(),
//         branchId: z.string(),
//         products: z.array(
//           z.object({
//             productId: z.string(),
//             quantity: z.number(),
//           })
//         ),
//       },
//     },
//     async (params) => {
//       for (const product of params.products) {
//         await BranchInventoryModel.update(
//           { quantityOnHand: literal(`quantityOnHand - ${product.quantity}`) },
//           { where: { productId: product.productId, branchId: params.branchId, organizationId: params.organizationId } }
//         );
//       }
//       try {
//         return {
//           content: [{ type: 'text', text: 'Branch stock adjusted successfully' }],
//         };
//       } catch (error: any) {
//         return {
//           content: [{ type: 'text', text: 'Failed to update the branch’s inventory' }],
//         };
//       }
//     }
//   );
// };
