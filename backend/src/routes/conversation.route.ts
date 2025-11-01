import express from 'express';
import { adminAuthMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { ConversationService } from '../services/conversation.service';
const convRoute = express.Router();

convRoute.get('/get-conversation-by-orgId', adminAuthMiddleware, async (req, res) => {
  try {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 5;
    const organizationId = req.query.organizationId || '';

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await ConversationService.getConversationsbyOrgId(organizationId as string, { offset, limit, page });
    const response: APIResponseFormat<any> = {
      message: 'request successfully',
      data,
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

export { convRoute };
