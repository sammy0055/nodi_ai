import { Sequelize } from 'sequelize';
import { appConfig } from '../config';
import { stripe } from '../helpers/stripe';
import { CreditBalanceModel } from '../models/creditBalance.model';
import { SubscriptionPlanModel } from '../models/subscription-plan.model';
import { SubscriptionsModel } from '../models/subscriptions.model';
import { UsageRecordModel } from '../models/usage-records.model';
import { User } from '../types/users';

export class SubscriptionService {
  static readonly successUrl = appConfig.stripe.successUrl;
  static readonly cancelUrl = appConfig.stripe.cancelUrl;
  static async subscribeToPlan(planId: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.organizationId) throw new Error('organization does not exist, so you can not subscribe');
    const plan = await SubscriptionPlanModel.findByPk(planId);
    if (!plan) throw new Error('subscription plan does not exist');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePlanPriceId,
          quantity: 1,
        },
      ],
      success_url: this.successUrl,
      cancel_url: this.cancelUrl,
      client_reference_id: user.id,
      subscription_data: { metadata: { planId: plan.id, organizationId: user.organizationId } }, // optional extra
    });

    return { url: session.url };
  }

  static async getSubscripton(user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.organizationId) throw new Error('user is not authenticated');
    return await SubscriptionsModel.findOne({ where: { organizationId: user.organizationId } });
  }

  static async getCreditUsage(user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.organizationId) throw new Error('user is not authenticated');
    return await UsageRecordModel.findAll({ where: { organizationId: user.organizationId! }, limit: 10 });
  }

  static async getCreditBalance(user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.organizationId) throw new Error('user is not authenticated');
    return await CreditBalanceModel.findOne({ where: { organizationId: user.organizationId! } });
  }

  static async upgradeSubscription(planId: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.organizationId) throw new Error('organization does not exist, so you can not subscribe');
    const plan = await SubscriptionPlanModel.findByPk(planId);
    if (!plan) throw new Error('subscription plan does not exist');
    const sub = await SubscriptionsModel.findOne({
      where: { organizationId: user.organizationId },
    });
    if (!sub) throw new Error('you do not have an active subscription, please subscribe to a plan');
    const subscription = await stripe.subscriptions.retrieve(sub.subscriptionId!, {
      expand: ['items.data.price.product'], // optional: expands price/product info
    });

    await stripe.subscriptions.update(subscription.id, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: plan.stripePlanPriceId, // plan they upgrade to
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  // app-user
  static async getSubscriptionStatistics() {
    const planCounts = await SubscriptionsModel.findAll({
      include: [
        {
          model: SubscriptionPlanModel,
          as: 'plan',
          attributes: [],
        },
      ],
      attributes: [
        [Sequelize.col('plan.name'), 'planName'],
        [Sequelize.fn('COUNT', Sequelize.col('SubscriptionsModel.id')), 'count'],
      ],
      group: ['plan.name'],
      raw: true,
    });
    const result = planCounts.reduce((acc, item: any) => {
      acc[item.planName] = Number(item.count);
      return acc;
    }, {} as any);
    return result;
  }
}
