import { SubstriptionStatusTypes } from '../data/data-types';

export interface ISubscription {
  id: string; // UUID
  organizationId?: string | null; // nullable foreign key
  planId?: string | null; // UUID foreign key to SubscriptionPlans
  customerId?: string | null;
  subscriptionId?: string | null;
  status: `${SubstriptionStatusTypes}`;
  startDate: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  nextBillingDate: Date | null;
  cancelAtPeriodEnd: boolean;
}
