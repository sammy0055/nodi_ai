import { stripe } from '../helpers/stripe';
import { SubscriptionPlanModel } from '../models/subscription-plan.model';
import { ISubscriptionPlan } from '../types/subscription-plan';

export class SubscriptionPanService {
  static async createSubscriptionPlan(plan: ISubscriptionPlan) {
    const subscriptionPlan = await stripe.products.create({
      name: plan.name,
      description: plan.description,
    });

    const subPrice = await stripe.prices.create({
      unit_amount: plan.price * 100, // in cents
      currency: 'usd',
      recurring: { interval: 'month' },
      product: subscriptionPlan.id,
    });

    const payload: ISubscriptionPlan = {
      ...plan,
      stripePlanId: subscriptionPlan.id,
      stripePlanPriceId: subPrice.id,
    };

    return await SubscriptionPlanModel.create(payload);
  }
  static async getSubscriptionPlans() {
    return await SubscriptionPlanModel.findAll()
  }
}
