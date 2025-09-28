export interface ISubscription {
  id: string;
  organizationId?: string | null;
  planId: string;
  subscriptionId: string;
  status: 'active' | 'past_due' | 'trialing' | 'expired';
  startDate: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate: Date;
  cancelAtPeriodEnd: boolean;
}

export interface CreditBalanceAttributes {
  id: string;
  organizationId: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
}

export interface UsageRecordAttributes {
  id: string;
  organizationId: string;
  subscriptionId: string;
  featureName: string;
  creditsConsumed: number;
  metadata: any;
  createdAt: Date;
}

export interface ISubscriptionPlan {
  id: string;
  stripePlanId: string;
  stripePlanPriceId: string;
  name: string;
  description: string;
  price: number;
  creditPoints: number;
  features?: string[];
}