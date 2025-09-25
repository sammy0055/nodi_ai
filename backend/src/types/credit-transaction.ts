import { CreditTransactionTypes } from "../data/data-types";

export interface CreditTransactionAttributes {
  id: string;
  organizationId: string; 
  subscriptionId: string;
  transactionType: `${CreditTransactionTypes}`
  amount: number;
  description: string;
}
