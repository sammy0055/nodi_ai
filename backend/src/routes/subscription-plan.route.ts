import express from 'express';
import { validateSubscriptionPlanSchema } from '../middleware/validation/subscription-plan';
import { SubscriptionPlanController } from '../controllers/subscription-plan';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';

export const subscriptionRoute = express.Router();
subscriptionRoute.post('/create-plan', validateSubscriptionPlanSchema(), async (req, res) => {
  try {
    const data = await SubscriptionPlanController.createSubscriptionPlan(req.body);
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

subscriptionRoute.get('/get-subscription-plans', async (req, res) => {
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
