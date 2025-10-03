import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ManageVectorStore } from '../../../helpers/vector-store';
import { AreaModel } from '../../../models/area.model';
import { Op } from 'sequelize';
import { BranchesModel } from '../../../models/branches.model';
import { ZoneModel } from '../../../models/zones.model';
import dayjs from 'dayjs';
import { IArea } from '../../../types/area';
// Get delivery options for area
export const getDeliveryOptions = (server: McpServer) => {
  return server.registerTool(
    'get_delivery_options',
    {
      title: 'get_delivery_options',
      description: "Get available delivery options for customer's area",
      inputSchema: {
        organizationId: z.string(),
        area: z.string().describe("Customer's area"),
        branchId: z.string().describe('Optional specific branch').optional(),
      },
    },
    async (params) => {
      const vectorStore = new ManageVectorStore();
      try {
        const areas = await vectorStore.searchAreas({
          query: params.area,
          organizationId: params.organizationId,
          branchId: params.branchId,
        });

        if (!areas) {
          return { content: [{ type: 'text', text: 'no area found' }] };
        }

        const areaIds = areas.map((area: any) => area.id);

        const areasDetails = AreaModel.findAll({
          where: {
            id: {
              [Op.in]: areaIds.filter(Boolean),
            },
          },
          include: [
            { model: BranchesModel, as: 'branch' },
            { model: ZoneModel, as: 'zone' },
          ],
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(areasDetails),
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
              text: `Failed to get available delivery options for customer's area`,
            },
          ],
        };
      }
    }
  );
};

// Calculate delivery cost and time
export const calculateDelivery = (server: McpServer) => {
  return server.registerTool(
    'calculate_delivery',
    {
      title: 'calculate_delivery',
      description: 'Calculate delivery time and cost for specific area and branch',
      inputSchema: {
        organizationId: z.string(),
        area: z.string(),
        branchId: z.string(),
        zone: z.string(),
      },
    },
    async (params) => {
      const vectorStore = new ManageVectorStore();
      try {
        const areas: IArea[] = (await vectorStore.searchAreas({
          query: params.area,
          organizationId: params.organizationId,
          branchId: params.branchId,
        })) as any;

        if (!areas) {
          return { content: [{ type: 'text', text: 'no area found' }] };
        }
        areas.forEach((d) => {
          const diffMinutes = dayjs().diff(dayjs(d?.deliveryTime), 'minute');
          const diffHours = dayjs().diff(dayjs(d.deliveryTime), 'hour');
          const diffDays = dayjs().diff(dayjs(d.deliveryTime), 'day');
          const diffMonths = dayjs().diff(dayjs(d.deliveryTime), 'month');

          console.log({ diffMinutes, diffHours, diffDays, diffMonths });
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(areas),
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
              text: 'Failed to calculate delivery time and cost for specific area and branch',
            },
          ],
        };
      }
    }
  );
};
