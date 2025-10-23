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
      featues: plan.featues,
      price: plan.price,
      stripePlanPriceId: newPriceId,
    };

    const [_, subPlan] = await SubscriptionPlanModel.update(payload, { where: { id: plan.id }, returning: true });
    return subPlan[0].get({ plain: true }); // plain JS object
  }
  static async getSubscriptionPlans() {
    return await SubscriptionPlanModel.findAll();
  }
}
