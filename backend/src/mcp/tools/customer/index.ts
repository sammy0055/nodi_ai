import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { models } from '../../../models';

const { CustomerModel } = models;
export const getCustomerProfile = (server: McpServer) => {
  return server.registerTool(
    'get_customer_info',
    {
      title: 'get_customer_info',
      description: 'get customers profile in organization',
      inputSchema: {
        organizationId: z.string().describe('the id of the organization'),
        customerId: z.string().describe('the customers unique ID'),
      },
    },
    async (param) => {
      try {
        const customer = await CustomerModel.findOne({
          where: { id: param.customerId, organizationId: param.organizationId },
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(customer) }],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR:${error.message}`);
        return {
          content: [{ type: 'text', text: 'Failed to get customer profile' }],
        };
      }
    }
  );
};

export const createCustomerProfile = (server: McpServer) => {
  return server.registerTool(
    'update_customer_profile',
    {
      title: 'update_customer_profile',
      description: 'update profile for the customer',
      inputSchema: {
        organizationId: z.string().describe('the id of the organization'),
        customerId: z.string().describe('the customers unique ID'),
        name: z.string(),
        phone: z.string().optional(),
      },
    },
    async (param) => {
      try {
        const customer = await CustomerModel.update(
          { name: param.name },
          { where: { organizationId: param.organizationId, id: param.customerId } }
        );
        return {
          content: [{ type: 'text', text: `Customr profile updated successfully: ${JSON.stringify(customer)}` }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Failed to update customer profile` }],
        };
      }
    }
  );
};
