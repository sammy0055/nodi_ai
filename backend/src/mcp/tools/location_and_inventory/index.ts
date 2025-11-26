import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ManageVectorStore } from '../../../helpers/vector-store';
import { IArea } from '../../../types/area';
import { BranchesModel } from '../../../models/branches.model';
import { Op } from 'sequelize';
import { models } from '../../../models';
import { WhatSappSettingsModel } from '../../../models/whatsapp-settings.model';
import { WhatsappFlowLabel } from '../../../types/whatsapp-settings';

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

// get all branches
export const getBranches = (server: McpServer) => {
  return server.registerTool(
    'get_all_branches',
    {
      title: 'Get All Branches',
      description: 'Return a full list of all branches from the organization.',
      inputSchema: {
        organizationId: z.string(),
      },
    },
    async (params) => {
      try {
        const branches = await BranchesModel.findAll({ where: { organizationId: params.organizationId } });

        if (branches?.length === 0) {
          return {
            content: [{ type: 'text', text: 'No branch was found for this organization' }],
          };
        }

        const filteredBranches = branches.map((z) => ({ id: z.id, title: z.name }));
        const whatsappSettings = await WhatSappSettingsModel.findOne({
          where: { organizationId: params.organizationId },
        });

        const flow = whatsappSettings?.whatsappTemplates?.find(
          (w) => w.type === 'flow' && w.data?.flowLabel === WhatsappFlowLabel.BRANCHES_FLOW
        );

        const data = {
          branches: filteredBranches,
          flowId: flow?.type === 'flow' && flow?.data.flowId,
          flowName: flow?.type === 'flow' && flow?.data.flowName,
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(data), mimeType: 'application/json' }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: 'Failed to get branches' }],
        };
      }
    }
  );
};
