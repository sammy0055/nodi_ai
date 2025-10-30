import express from 'express';

export const subscriptionRouter = express.Router();
import { SubscriptionController } from '../controllers/subscription.controller';
import { adminAuthMiddleware, authMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';

subscriptionRouter.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { planId } = req.body;
  const user = req.user;
  try {
    const data = await SubscriptionController.subscribeToPlan(planId, user!);
    const response: APIResponseFormat<any> = {
      message: 'checkout session created successfully',
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

subscriptionRouter.post('/upgrade-subscription', authMiddleware, async (req, res) => {
  const { planId } = req.body;
  const user = req.user;
  try {
    const data = await SubscriptionController.upgradeSubscription(planId, user!);
    const response: APIResponseFormat<any> = {
      message: 'subscription upgraded successfully',
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

subscriptionRouter.get('/get-subscription', authMiddleware, async (req, res) => {
  try {
    const data = await SubscriptionController.getSubscripton(req.user!);
    const response: APIResponseFormat<any> = {
      message: 'subscription retrieved successfully',
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

subscriptionRouter.get('/get-credit-usage', authMiddleware, async (req, res) => {
  try {
    const data = await SubscriptionController.getCreditUsage(req.user!);
    const response: APIResponseFormat<any> = {
      message: 'subscription retrieved successfully',
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

subscriptionRouter.get('/get-credit-balance', authMiddleware, async (req, res) => {
  try {
    const data = await SubscriptionController.getCreditBalance(req.user!);
    const response: APIResponseFormat<any> = {
      message: 'subscription retrieved successfully',
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

// app-user route
subscriptionRouter.get('/get-subscription-statistics', adminAuthMiddleware, async (req, res) => {
  try {
    const data = await SubscriptionController.getSubscriptionStatisticsForOrg();
    const response: APIResponseFormat<any> = {
      message: 'subscription retrieved successfully',
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
