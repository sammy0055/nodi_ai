import { SubstriptionStatusTypes } from "../data/data-types";

export interface ISubscription {
  id: string; // UUID
  organizationId?: string | null; // nullable foreign key
  planId: string; // UUID foreign key to SubscriptionPlans
  status: `${SubstriptionStatusTypes}`; 
  startDate: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate: Date;
  cancelAtPeriodEnd: boolean;
}
