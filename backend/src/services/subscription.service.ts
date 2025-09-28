import { appConfig } from '../config';
import { stripe } from '../helpers/stripe';
import { SubscriptionPlanModel } from '../models/subscription-plan.model';
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
      subscription_data: { metadata: { planId: plan.id, organizationId:user.organizationId } }, // optional extra
    });

    return { url: session.url };
  }
}
