import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { Op } from 'sequelize';
import { ManageVectorStore } from '../../../helpers/vector-store';
import { models } from '../../../models';
import { CurrencyCode } from '../../../types/product';
import { OrderStatusTypes } from '../../../types/order';
import { ChatHistoryManager } from '../../../services/ChatHistoryManager.service';
import { getEstimatedTime } from '../../../utils/getEstimatedTime';

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
        deliveryAreaId: z
          .string()
          .describe('the id of the delivery area. must be present if order is delivery.')
          .optional(),
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
        if (params.serviceType === 'takeaway') delete params.deliveryAreaId;
        const order = await OrderModel.create(params as any);
        let serviceTimeEstimate = '';
        if (order) {
          for (const product of products) {
            await BranchInventoryModel.decrement('quantityOnHand', {
              by: product.qty,
              where: {
                productId: product.productId,
                branchId: params.branchId,
                organizationId: params.organizationId,
              },
            });
          }

          // summarizeConversation
          // const { summarizeConversationById, insertConversationSummary } = new ChatHistoryManager();
          // const conversationId = process.env.conversationId;
          // if (!conversationId) throw new Error('conversation id is missing');
          // const summary = await summarizeConversationById(conversationId);
          // await insertConversationSummary({
          //   summary: summary,
          //   organizationId: params.organizationId,
          //   conversationId: conversationId,
          //   customerId: params.customerId,
          // });

          const branch = await BranchesModel.findByPk(params.branchId);
          const serviceTime = params.serviceType == 'delivery' ? branch?.deliveryTime : branch?.takeAwayTime;
          const serviceTimePut = branch ? getEstimatedTime(serviceTime!) : '';
          serviceTimeEstimate = serviceTimePut ? `estimated service time: ${serviceTimePut}` : '';
        }

        return {
          content: [
            {
              type: 'text',
              text: `Your order has being created with orderId: ${order.id}, ${serviceTimeEstimate}`,
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
        // orderId: z.string().describe('the id of the order'),
        customerId: z.string().describe('the id of the customer'),
        organizationId: z.string(),
      },
    },
    async ({ customerId, organizationId }) => {
      // check if we are still within the cancelation window

      const order = await OrderModel.findOne({ where: { organizationId, customerId }, order: [['createdAt', 'DESC']] });

      if (!order) {
        return { content: [{ type: 'text', text: 'order was not found' }] };
      }

      if (!order.canBeCancelled()) {
        return { content: [{ type: 'text', text: 'order has passed cancelation window' }] };
      }

      if (order.status === 'cancelled') {
        return { content: [{ type: 'text', text: 'order is already cancelled' }] };
      }

      if (order.status === 'delivered') {
        return {
          content: [{ type: 'text', text: 'your order has already being delivered, hence can not be cancelled' }],
        };
      }

      if (order.status !== 'pending') {
        const branch = await BranchesModel.findOne({ where: { id: order.branchId, organizationId } });
        if (!branch) return { content: [{ type: 'text', text: 'something went wrong please try again later' }] };
        if (!branch.phone) return { content: [{ type: 'text', text: 'something went wrong please try again later' }] };

        return {
          content: [{ type: 'text', text: `kinldy contact our hotline to cancel your order. phone:${branch.phone}` }],
        };
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

export const getLastOrderDetails = (server: McpServer) => {
  return server.registerTool(
    'get_last_order_details',
    {
      title: 'get_last_order_details',
      description: 'get the customers last order',
      inputSchema: {
        organizationId: z.string(),
        customerId: z.string(),
      },
    },
    async (params) => {
      try {
        const { customerId, organizationId } = params;
        const order = await OrderModel.findOne({
          where: { organizationId, customerId },
          order: [['createdAt', 'DESC']],
        });

        if (!order) {
          return { content: [{ type: 'text', text: 'order was not found' }] };
        }

        return { content: [{ type: 'text', text: JSON.stringify(order), mimeType: 'application/json' }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: 'order was not found' }] };
      }
    }
  );
};

export const updateOrder = (server: McpServer) => {
  return server.registerTool(
    'update_order',
    {
      title: 'update_order',
      description: 'Update the customers last order.',
      inputSchema: {
        title: z.string().describe('title for the order'),
        organizationId: z.string(),
        customerId: z.string(),
        branchId: z.string(),
        currency: z.enum(currencyCodes as any),
        deliveryAreaId: z
          .string()
          .describe('the id of the delivery area. must be present if order is delivery.')
          .optional(),
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
      },
    },
    async (params) => {
      try {
        const { customerId, organizationId } = params;
        const order = await OrderModel.findOne({
          where: { organizationId, customerId },
          order: [['createdAt', 'DESC']],
        });
        if (!order) {
          return { content: [{ type: 'text', text: 'order was not found' }] };
        }

        if (order.status === 'pending') {
          const products = params.items.map((item) => ({ productId: item.productId, qty: item.quantity }));
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
          if (params.serviceType === 'takeaway') delete params.deliveryAreaId;
          await order.update(params as any);
          for (const product of products) {
            await BranchInventoryModel.decrement('quantityOnHand', {
              by: product.qty,
              where: {
                productId: product.productId,
                branchId: params.branchId,
                organizationId: params.organizationId,
              },
            });
          }

          return {
            content: [
              {
                type: 'text',
                text: `Your order has being updated successfully`,
              },
            ],
          };
        }

        if (order.status === 'delivered') {
          return {
            content: [{ type: 'text', text: 'your order has already being delivered hence can not be updated' }],
          };
        }

        const branch = await BranchesModel.findOne({ where: { id: order.branchId, organizationId } });
        if (!branch) return { content: [{ type: 'text', text: 'something went wrong please try again later' }] };
        if (!branch.phone) return { content: [{ type: 'text', text: 'something went wrong please try again later' }] };

        return {
          content: [{ type: 'text', text: `kinldy contact our hotline to update your order. phone:${branch.phone}` }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: 'Failed to cancel order' }],
        };
      }
    }
  );
};
