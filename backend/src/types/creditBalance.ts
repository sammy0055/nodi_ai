export interface CreditBalanceAttributes {
  id: string; // UUID
  organizationId: string; 
  totalCredits: number; // defaults to 0
  usedCredits: number;  // defaults to 0
  remainingCredits: number; // defaults to 0
}
