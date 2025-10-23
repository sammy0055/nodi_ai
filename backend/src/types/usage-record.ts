export interface UsageRecordAttributes {
  id: string;
  organizationId: string;
  subscriptionId: string;
  featureName: `${creditFeatureName}`;
  creditsConsumed: number;
  metadata: any;
}

export enum creditFeatureName {
  CatalogAPICall = 'catalog_api_call',
  WhatSappConversation = 'whatsapp_conversation',
  Chatbot = 'chatbot_token',
  All = "all"
}
