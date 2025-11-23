import express from 'express';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { validateRequestSchema, validateUpdateRequestSchema } from '../middleware/validation/request';
import { RequestController } from '../controllers/request.controller';
import { adminAuthMiddleware, authMiddleware } from '../middleware/authentication';
export const requestRoute = express.Router();

requestRoute.post('/create', validateRequestSchema(), authMiddleware, async (req, res) => {
  try {
    const data = await RequestController.createRequest(req.body, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'request created successfully',
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

requestRoute.post('/approve', validateUpdateRequestSchema(), adminAuthMiddleware, async (req, res) => {
  try {
    const data = await RequestController.approveRequest(req.body, req.adminUser!);
    const response: APIResponseFormat<any> = {
      message: 'request approved successfully',
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

requestRoute.post('/update-waba', adminAuthMiddleware, async (req, res) => {
  try {
    const data = await RequestController.updateOrganizationWABA(req.body, req.adminUser!);
    const response: APIResponseFormat<any> = {
      message: 'request approved successfully',
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

requestRoute.get('/get-requests', adminAuthMiddleware, async (req, res) => {
  try {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 5;
    const status: any = req.query.status || '';

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await RequestController.getRequests({ status }, { offset, limit, page });
    const response: APIResponseFormat<any> = {
      message: 'request retreived successfully',
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
  requestRoute.get('/get-request', authMiddleware, async (req, res) => {
    try {
      const requestType = req.query.requestType as any;
      const data = await RequestController.getRequest(req.user!, requestType);
      const response: APIResponseFormat<any> = {
        message: 'request retreived successfully',
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
});
