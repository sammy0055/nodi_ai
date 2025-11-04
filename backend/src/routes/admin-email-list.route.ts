import express from 'express';
import { adminAuthMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { AdminEmailListService } from '../services/adminEmail-list.service';

const adminEmailListRoute = express.Router();

adminEmailListRoute.post('/add-email', adminAuthMiddleware, async (req, res) => {
  try {
    const data = await AdminEmailListService.addEmail(req.body.email as string);
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

adminEmailListRoute.post('/verify-email', adminAuthMiddleware, async (req, res) => {
  try {
    const { code, emailId } = req.body;
    const data = await AdminEmailListService.verifyEmail(emailId, code);
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

adminEmailListRoute.get('/get-notification-emails', adminAuthMiddleware, async (req, res) => {
  try {
    const data = await AdminEmailListService.getEmails();
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

adminEmailListRoute.delete('/delete-email', adminAuthMiddleware, async (req, res) => {
  try {
    await AdminEmailListService.deleteEmail(req.query.emailId as string);
    const response: APIResponseFormat<any> = {
      message: 'request successfully',
      data: [],
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

export { adminEmailListRoute };
