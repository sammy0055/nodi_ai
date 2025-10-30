import express from 'express';
import { validateSubscriptionPlanSchema } from '../middleware/validation/subscription-plan';
import { SubscriptionPlanController } from '../controllers/subscription-plan';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { adminAuthMiddleware } from '../middleware/authentication';

export const subscriptionPlanRoute = express.Router();
subscriptionPlanRoute.post('/create-plan', validateSubscriptionPlanSchema(), adminAuthMiddleware, async (req, res) => {
  try {
    const data = await SubscriptionPlanController.createSubscriptionPlan(req.body, req.adminUser as any);
    const response: APIResponseFormat<any> = {
      message: 'subscription plan created successfully',
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

subscriptionPlanRoute.post('/update-subscripton-plan', adminAuthMiddleware, async (req, res) => {
  try {
    const data = await SubscriptionPlanController.updateSubscriptionPlan(req.body, req.adminUser as any);
    const response: APIResponseFormat<any> = {
      message: 'subscription plan updated successfully',
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

subscriptionPlanRoute.delete('/remove-subscription-plan', adminAuthMiddleware, async (req, res) => {
  try {
    const planId = req.body.planId as string;
    const data = await SubscriptionPlanController.removeSubscriptionPlan(planId);
    const response: APIResponseFormat<any> = {
      message: 'subscription plan updated successfully',
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

subscriptionPlanRoute.get('/get-subscription-plans', async (req, res) => {
  try {
    const data = await SubscriptionPlanController.getSubscriptionPlans();
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
