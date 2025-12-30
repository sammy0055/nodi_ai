import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { models } from '../../../models';
import { OrderModel } from '../../../models/order.module';

const { ReviewModel, OrganizationsModel } = models;

export const getOrganizationReviewQuestions = (server: McpServer) => {
  return server.registerTool(
    'get_review_questions',
    {
      title: 'Get Customer Review Questions',
      description:
        'Fetches the organization-specific review questions used to collect customer feedback and ratings after a purchase or service interaction.',
      inputSchema: {
        organizationId: z.string().describe('the id of the organization'),
      },
    },
    async (args) => {
      try {
        const org = await OrganizationsModel.findByPk(args.organizationId);
        if (!org?.reviewQuestions || org?.reviewQuestions.length === 0) {
          return {
            content: [{ type: 'text', text: 'no review questions for this organization' }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(org.reviewQuestions) }],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR-CREATE-REVIEW:${error.message}`);
        return {
          content: [{ type: 'text', text: 'Review created successfully' }],
        };
      }
    }
  );
};

export const createReview = (server: McpServer) => {
  return server.registerTool(
    'create_review',
    {
      title: 'create_review',
      description: 'create a review for an order',
      inputSchema: {
        organizationId: z.string().describe('the id of the organization'),
        customerId: z.string().describe('the customers unique ID'),
        orderId: z.string().describe('the order unique ID'),
        rating: z.number().min(1).max(5).describe('the rating for the order'),
        items: z.array(
          z.object({
            id: z.string().describe('question id'),
            question: z.string(),
            answer: z.string().describe('answer to question'),
          })
        ),
      },
    },
    async (param) => {
      try {
        const createdReview = await ReviewModel.create(param);
        await OrderModel.update(
          { isReviewed: true, reviewedAt: new Date() },
          { where: { id: createdReview.orderId, organizationId: createdReview.orgainzationId } }
        );
        return {
          content: [{ type: 'text', text: 'Review created successfully' }],
        };
      } catch (error: any) {
        console.error(`MCP-ERROR-CREATE-REVIEW:${error.message}`);
        return {
          content: [{ type: 'text', text: 'Failed to create review' }],
        };
      }
    }
  );
};
