import express from 'express';
import { stripe } from '../helpers/stripe';
import { appConfig } from '../config';
import Stripe from 'stripe';
import { OrganizationsModel } from '../models/organizations.model';
import { SubscriptionsModel } from '../models/subscriptions.model';
import { SubscriptionPlanModel } from '../models/subscription-plan.model';
import { CreditBalanceModel } from '../models/creditBalance.model';

export const stripeWebHookRoute = express.Router();

stripeWebHookRoute.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as any, appConfig.stripe.webhookSecret);
  } catch (err: any) {
    console.error(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const calculateBillingCycle = () => {
    const now = new Date();

    const startDate = now; // subscription starts now
    const currentPeriodStart = now; // first billing period starts now
    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // add 1 month
    const nextBillingDate = new Date(currentPeriodEnd); // next billing date is end of current period

    return { startDate, currentPeriodStart, currentPeriodEnd, nextBillingDate };
  };

  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const priceId = subscription.items.data[0].price.id;
        const metadata = subscription.metadata as { planId: string; organizationId: string };
        const { startDate, currentPeriodStart, currentPeriodEnd, nextBillingDate } = calculateBillingCycle();
        const sub = await SubscriptionsModel.findOne({ where: { subscriptionId: subscription.id } });
        if (sub) throw new Error('organization already has an active subscription, kindly update subscription');
        const subscriptionPlan = await SubscriptionPlanModel.findByPk(metadata.planId);
        if (!subscriptionPlan) throw new Error('subscripton plan does not exist in our records');
        await OrganizationsModel.update({ stripeCustomerId: customerId }, { where: { id: metadata.organizationId } });
        await SubscriptionsModel.create({
          planId: metadata.planId,
          subscriptionId: subscriptionId,
          organizationId: metadata.organizationId,
          startDate,
          currentPeriodStart,
          currentPeriodEnd,
          nextBillingDate,
          status: 'active',
        });
        await CreditBalanceModel.create({
          organizationId: metadata.organizationId,
          totalCredits: subscriptionPlan.creditPoints,
          remainingCredits: subscriptionPlan.creditPoints,
          usedCredits: subscriptionPlan.creditPoints,
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const priceId = subscription.items.data[0].price.id;
        const plan = await SubscriptionPlanModel.findOne({ where: { stripePlanPriceId: priceId } });
        if (!plan) throw new Error('subscribe plan does not exist in our records, subscriptionId:' + subscriptionId);
        const org = await OrganizationsModel.findOne({ where: { stripeCustomerId: customerId } });
        if (!org) throw new Error('this user is not part af an organization');
        const { startDate, currentPeriodStart, currentPeriodEnd, nextBillingDate } = calculateBillingCycle();
        await SubscriptionsModel.update(
          {
            planId: plan?.id,
            subscriptionId: subscriptionId,
            startDate,
            currentPeriodStart,
            currentPeriodEnd,
            nextBillingDate,
            status: 'active',
          },
          { where: { subscriptionId: subscriptionId } }
        );

        await CreditBalanceModel.update(
          {
            organizationId: org.id,
            totalCredits: plan.creditPoints,
            remainingCredits: plan.creditPoints,
            usedCredits: plan.creditPoints,
          },
          { where: { organizationId: org.id } }
        );
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const sub = await SubscriptionsModel.findOne({ where: { subscriptionId: subscription.id } });
        if (!sub) throw new Error('subscription does not exist for this user');

        await CreditBalanceModel.update(
          {
            totalCredits: 0,
            remainingCredits: 0,
            usedCredits: 0,
          },
          { where: { organizationId: sub.organizationId! } }
        );
        await sub.update({ status: 'expired' });
        break;
      }
    }
  } catch (error: any) {
    console.error(error.message);
    // send alert to app-admin
  }
});
