export interface UsageRecordAttributes {
  id: string;
  organizationId: string;
  subscriptionId: string;
  featureName: string;
  creditsConsumed: number;
  metadata: any;
}
