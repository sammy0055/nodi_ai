import { Sequelize } from 'sequelize';
import { appConfig } from '../config';
import { stripe } from '../helpers/stripe';
import { CreditBalanceModel } from '../models/creditBalance.model';
import { SubscriptionPlanModel } from '../models/subscription-plan.model';
import { SubscriptionsModel } from '../models/subscriptions.model';
import { UsageRecordModel } from '../models/usage-records.model';
import { User } from '../types/users';
import { OrganizationsModel } from '../models/organizations.model';

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
    const planCounts = await SubscriptionPlanModel.findAll({
      attributes: [
        ['name', 'planName'],
        [Sequelize.fn('COUNT', Sequelize.col('subscriptions.id')), 'count'],
      ],
      include: [
        {
          model: SubscriptionsModel,
          as: 'subscriptions',
          attributes: [],
          required: false, // include plans even if no subs
        },
      ],
      group: ['SubscriptionPlans.id'], // ✅ use table alias, not model name
      raw: true,
    });

    const result = planCounts.reduce((acc: Record<string, number>, item: any) => {
      acc[item.planName] = Number(item.count);
      return acc;
    }, {});

    return result;
  }

  // app-admin functions --------------------------------
  static async createSubscriptionForOrg({ orgId, creditPoint }: { orgId: string; creditPoint: number }) {
    const org = await OrganizationsModel.findByPk(orgId);
    if (!org) throw new Error('organization does not exist');
    const sub = await SubscriptionsModel.create({
      organizationId: orgId,
      startDate: new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: null,
      nextBillingDate: null,
      customerId: null,
      subscriptionId: null,
      status: 'active',
    });

    await CreditBalanceModel.create({
      organizationId: orgId,
      totalCredits: creditPoint,
      usedCredits: 0,
      remainingCredits: creditPoint,
    });
    return sub;
  }

  static async updateSubscriptionCredit({
    organizationId,
    creditPoint,
  }: {
    organizationId: string;
    creditPoint: number;
  }) {
    if (!organizationId || !creditPoint) throw new Error('one or more input is missing');
    const creditBalance = await CreditBalanceModel.findOne({ where: { organizationId } });
    if (!creditBalance) throw new Error('subscription does not exist');
    return await creditBalance.increment(
      { totalCredits: creditPoint, remainingCredits: creditPoint },
      { silent: false }
    );
  }

  static async adminCancelOrgSubscription({ subId, orgId }: { subId: string; orgId: string }) {
    if (!subId || !orgId) throw new Error('one or more input is missing');
    await SubscriptionsModel.destroy({ where: { id: subId, organizationId: orgId } });
    await CreditBalanceModel.destroy({ where: { organizationId: orgId } });
  }
}
