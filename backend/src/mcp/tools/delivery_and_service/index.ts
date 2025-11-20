import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ManageVectorStore } from '../../../helpers/vector-store';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { IArea } from '../../../types/area';
import { models } from '../../../models';
import { WhatSappSettingsModel } from '../../../models/whatsapp-settings.model';
import { WhatsappFlowNames } from '../../../types/whatsapp-settings';

const { ZoneModel, BranchesModel, AreaModel } = models;
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

        if (areas.length === 0) {
          return { content: [{ type: 'text', text: 'no area found' }] };
        }

        const areaIds = areas.map((area: any) => area.id);

        const areasDetails = await AreaModel.findAll({
          where: {
            organizationId: params.organizationId,
            ...(params.branchId && { branchId: params.branchId }),
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
        // zone: z.string().optional(),
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

export const getAllZonesAndAreas = async (server: McpServer) => {
  return server.registerTool(
    'get_all_zones_and_areas',
    {
      title: 'get_all_zones_and_areas',
      description: 'Get all zones and areas for an organization',
      inputSchema: {
        organizationId: z.string(),
        maxResults: z.number().default(10).optional(),
      },
    },
    async (params) => {
      try {
        const zones = await ZoneModel.findAll({
          where: { organizationId: params.organizationId },
        });

        const filteredZones = zones.map((z) => ({ id: z.id, title: z.name }));
        const whatsappSettings = await WhatSappSettingsModel.findOne({
          where: { organizationId: params.organizationId },
        });

        const flow = whatsappSettings?.whatsappTemplates.find(
          (w) => w.type === 'flow' && w.data?.flowName === WhatsappFlowNames.ZONE_AND_AREAS_FLOW
        );
        const data = {
          zones: filteredZones,
          flowId: flow?.type === 'flow' && flow?.data.flowId,
          flowName: flow?.type === 'flow' && flow?.data.flowName,
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(data), mimeType: 'application/json' }],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR-GETZONES-AND-AREAS: ${error.message}`);
        return {
          content: [{ type: 'text', text: 'Failed to get Zones and Areas' }],
        };
      }
    }
  );
};
