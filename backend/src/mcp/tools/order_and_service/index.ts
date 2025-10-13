import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { Op } from 'sequelize';
import { ManageVectorStore } from '../../../helpers/vector-store';
import { models } from '../../../models';
import { CurrencyCode } from '../../../types/product';
import { OrderStatusTypes } from '../../../types/order';

const { BranchesModel, OrderModel, BranchInventoryModel } = models;
// Create order with inventory check
const currencyCodes = Object.values(CurrencyCode);
export const createOrder = (server: McpServer) => {
  return server.registerTool(
    'create_order',
    {
      title: 'create_order',
      description: 'Create an order with inventory reservation',
      inputSchema: {
        title: z.string().describe('title for the order'),
        organizationId: z.string(),
        customerId: z.string(),
        branchId: z.string(),
        currency: z.enum(currencyCodes as any),
        deliveryAreaId: z.string().describe('the id of the delivery area'),
        serviceType: z.enum(['delivery', 'takeaway']),
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number(),
            selectedOptions: z
              .array(
                z.object({
                  optionId: z.string(),
                  optionName: z.string(),
                  choiceId: z.string(),
                  choiceLabel: z.string(),
                  priceAdjustment: z.string(),
                })
              )
              .optional(),
          })
        ),
        subtotal: z.number(),
        deliveryCharge: z.number(),
        totalAmount: z.number(),
        deliveryAreaName: z.string(),
        shippingAddress: z
          .string()
          .describe('Full delivery address: street, building, floor, apartment, landmark.')
          .optional(),
        shippingAddressCoordinates: z
          .object({
            longitude: z.number(),
            latitude: z.number(),
            googleMapUrl: z.string(),
          })
          .optional(),
      },
    },
    async (params) => {
      const products = params.items.map((item) => ({ productId: item.productId, qty: item.quantity }));
      try {
        const inventoryStock = await BranchInventoryModel.findAll({
          where: {
            productId: {
              [Op.in]: products.map((p) => p.productId).filter(Boolean),
            },
            branchId: params.branchId,
          },
        });

        if (!inventoryStock) {
          return { content: [{ type: 'text', text: 'No inventory available for this products' }] };
        }

        for (const product of products) {
          const inventoryItem = inventoryStock.find((inv) => inv.productId === product.productId);
          if (!inventoryItem || inventoryItem.quantityOnHand! < product.qty) {
            return { content: [{ type: 'text', text: `Product with ID: ${product.productId} is out of stock` }] };
          }
        }
        const order = await OrderModel.create(params as any);
        return {
          content: [
            {
              type: 'text',
              text: `Your order has being created with orderId: ${order.id}`,
            },
          ],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR:${error.message}`);
        return {
          content: [
            {
              type: 'text',
              text: 'Failed to create order',
            },
          ],
        };
      }
    }
  );
};

export const getBranchInfo = (server: McpServer) => {
  return server.registerTool(
    'get_branch_info',
    {
      title: 'get_branch_info',
      description: 'Get comprehensive branch information including services and delivery areas',
      inputSchema: {
        organizationId: z.string(),
        branchId: z.string().optional(),
        area: z.string().describe('Filter by area if needed').optional(),
      },
    },
    async (params) => {
      const vectorStore = new ManageVectorStore();

      try {
        if (params.branchId) {
          const branch = await BranchesModel.findByPk(params.branchId);
          return { content: [{ type: 'text', text: JSON.stringify(branch) }] };
        }

        if (params.area) {
          const areas = await vectorStore.searchAreas({
            query: params.area,
            organizationId: params.organizationId,
          });

          const branches = await BranchesModel.findAll({
            where: { id: { [Op.in]: areas.map((ar: any) => ar.branchId).filter(Boolean) } },
          });

          return { content: [{ type: 'text', text: JSON.stringify(branches) }] };
        }
        const branches = await BranchesModel.findAll({ where: { organizationId: params.organizationId } });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(branches),
              mimeType: 'application/json',
            },
          ],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR:${error.message}`);
        return {
          content: [
            {
              type: 'text',
              text: 'Failed to get branch information',
            },
          ],
        };
      }
    }
  );
};

export const getOrderDetails = (server: McpServer) => {
  return server.registerTool(
    'get_order_details',
    {
      title: 'get_order_details',
      description:
        'Retrieves comprehensive information about a specific order including customer details, items, pricing, delivery information, and cancellation eligibility status.',
      inputSchema: {
        organizationId: z.string(),
        customerId: z.string().describe('the id of the customer'),
        orderId: z.string().describe('the id of the order').optional(),
        query: z.string().describe('Search query e.g(product names, order title)').optional(),
      },
    },
    async (params) => {
      const vectorStore = new ManageVectorStore();
      try {
        const results = await vectorStore.searchOrders(params);
        if (results?.length === 0) {
          return {
            content: [{ type: 'text', text: 'No order found' }],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(results), mimeType: 'application/json' }],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR:${error.message}`);
        return {
          content: [{ type: 'text', text: 'Failed to get order details' }],
        };
      }
    }
  );
};

export const cancelOrder = (server: McpServer) => {
  return server.registerTool(
    'cancel_order',
    {
      title: 'cancel_order',
      description:
        'Cancels an order if it is still within the allowed cancellation window. Validates eligibility before processing the cancellation.',
      inputSchema: {
        orderId: z.string().describe('the id of the order'),
        // customerId: z.string().describe('the id of the customer'),
        // organizationId: z.string(),
      },
    },
    async ({ orderId }) => {
      // check if we are still within the cancelation window
      if (!orderId) {
        return { content: [{ type: 'text', text: 'orderId messing, kindly provide the order ID' }] };
      }
      const order = await OrderModel.findByPk(orderId);

      if (!order) {
        return { content: [{ type: 'text', text: 'order was not found' }] };
      }
      if (!order.canBeCancelled()) {
        return { content: [{ type: 'text', text: 'order has passed cancelation window' }] };
      }
      await order.update({ status: OrderStatusTypes.CANCELLED });
      try {
        return {
          content: [{ type: 'text', text: 'order cancelled successfully' }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: 'Failed to cancel order' }],
        };
      }
    }
  );
};
