import express from 'express';

export const subscriptionRouter = express.Router();
import { SubscriptionController } from '../controllers/subscription.controller';
import { authMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';

subscriptionRouter.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { planId } = req.body;
  const user = req.user;
  try {
    const data = await SubscriptionController.subscribeToPlan(planId, user!);
    const response: APIResponseFormat<any> = {
      message: 'subscription plan retrieved successfully',
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
