import { stripe } from '../helpers/stripe';
import { SubscriptionPlanModel } from '../models/subscription-plan.model';
import { ISubscriptionPlan } from '../types/subscription-plan';
import { AdminUser } from '../types/users';

export class SubscriptionPlanService {
  static async createSubscriptionPlan(plan: ISubscriptionPlan, user: AdminUser) {
    // if (user.type !== 'admin') throw new Error('Forbidden');
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

  static async updateSubscriptionPlan(plan: ISubscriptionPlan, user: AdminUser) {
    if (!plan.id) throw new Error('subscription plan id is required');
    const oldPlan = await SubscriptionPlanModel.findByPk(plan.id);
    const isUpdateStripeProductRequired = oldPlan?.name !== plan.name || oldPlan.description !== plan.description;
    if (isUpdateStripeProductRequired) {
      // update product
      await stripe.products.update(plan.stripePlanId, {
        name: plan.name,
        description: plan.description,
      });
    }
    let newPriceId = plan.stripePlanPriceId;
    if (oldPlan?.price !== plan.price) {
      // create a new price (since price amount can't be changed)
      const newPrice = await stripe.prices.create({
        unit_amount: plan.price * 100, // in cents
        currency: 'usd',
        recurring: { interval: 'month' },
        product: plan.stripePlanId,
      });

      // optionally deactivate the old price
      await stripe.prices.update(plan.stripePlanPriceId, {
        active: false,
      });
      newPriceId = newPrice.id;
    }
    const payload = {
      name: plan.name,
      description: plan.description,
      creditPoints: plan.creditPoints,
      features: plan.features,
      price: plan.price,
      stripePlanPriceId: newPriceId,
    };
    const [_, subPlan] = await SubscriptionPlanModel.update(payload, { where: { id: plan.id }, returning: true });
    return subPlan[0].get({ plain: true }); // plain JS object
  }

  static async deleteSubscriptionPlan(planId: string) {
    if (!planId) throw new Error('subscription plan id is required');

    const plan = await SubscriptionPlanModel.findByPk(planId);
    if (!plan) throw new Error('subscription plan not found');

    // Delete product from Stripe
    await stripe.products.update(plan.stripePlanId, {
      active: false, // mark product inactive instead of hard delete
    });

    // Optionally, deactivate its prices
    const prices = await stripe.prices.list({ product: plan.stripePlanId });
    for (const price of prices.data) {
      await stripe.prices.update(price.id, { active: false });
    }

    // Delete from DB
    await SubscriptionPlanModel.destroy({ where: { id: plan.id } });
    return { success: true, message: 'Subscription plan deleted successfully' };
  }

  static async getSubscriptionPlans() {
    return await SubscriptionPlanModel.findAll();
  }
}
