import express from 'express';
import { adminAuthMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { NotificationService } from '../services/notification.service';

const NotificationRoute = express.Router();

NotificationRoute.get('/get-notifications', adminAuthMiddleware, async (req, res) => {
  try {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 5;
    const status: any = req.query.status || '';
    const priority: any = req.query.priority || '';
    const relatedEntityType: any = req.query.relatedEntityType || '';

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await NotificationService.getNotifications(
      { status, priority, relatedEntityType },
      { page, limit, offset }
    );
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

NotificationRoute.post('/mark-notification-as-read', adminAuthMiddleware, async (req, res) => {
  try {
    const notificationId = req.query.notificationId as string;
    await NotificationService.markNotificationAsRead(notificationId);
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

NotificationRoute.delete('/delete-notification', adminAuthMiddleware, async (req, res) => {
  try {
    const notificationId = req.query.notificationId as string;
    await NotificationService.deleteNotification(notificationId);
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

export { NotificationRoute };
