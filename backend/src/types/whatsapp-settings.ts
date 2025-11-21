import { WhatSappConnectionStatus } from '../data/data-types';
import { User } from './users';

// FLOW STRUCTURE
interface FlowData {
  flowId: string;
  flowLabel: `${WhatsappFlowLabel}`;
  flowName: string;
}

interface FlowTemplate {
  type: 'flow';
  isPublished: boolean;
  data: FlowData;
}

// NORMAL TEMPLATE STRUCTURE
interface TemplateData {
  templateName: string;
  variables?: string[];
  components?: any[];
}

interface MessageTemplate {
  type: 'template';
  data: TemplateData;
}

// UNION TYPE
export type WhatsAppTemplate = FlowTemplate | MessageTemplate;

export interface IWhatSappSettings {
  id?: string;
  organizationId: string | null;
  whatsappBusinessId: string;
  whatsappPhoneNumberId: string;
  whatsappPhoneNumber: string;
  connectionStatus: `${WhatSappConnectionStatus}`;
  accessToken: string | null;
  token_type: string | null;
  isSubscribedToWebhook: boolean;
  whatsappTemplates: WhatsAppTemplate[];
  catalogId?: string;
}

export interface WhatSappAuthPayload {
  code: string;
  whatsappBusinessId: string;
  whatsappPhoneNumberId: string;
  user: Pick<User, 'id' | 'organizationId'>;
}

export interface RegisterPhoneNumberArg {
  accessToken: string;
  whatsappBusinessId: string;
  whatsappPhoneNumberId: string;
}

export enum WhatsappFlowLabel {
  ZONE_AND_AREAS_FLOW = 'ZONE_AND_AREAS_FLOW',
  BRANCHES_FLOW = 'BRANCHES_FLOW',
}
export interface createWhatsappFlowArgs {
  accessToken: string;
  whatsappBusinessId: string;
  flowLabel: `${WhatsappFlowLabel}`;
  flowName: string;
  flowJson: string;
  flowEndpoint?: string;
}

export interface WhatsAppBusinessAccountPhoneNumber {
  verified_name: string;
  display_phone_number: string;
  id: string;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | string;
}

export interface WhatsAppPhoneNumberInfo {
  verified_name: string;
  code_verification_status: 'VERIFIED' | 'UNVERIFIED' | 'PENDING' | string;
  display_phone_number: string;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN' | string;
  platform_type: 'CLOUD_API' | 'ON_PREMISE' | string;
  throughput: {
    level: 'STANDARD' | 'NOT_APPLICABLE' | string;
  };
  last_onboarded_time: string; // ISO date string
  webhook_configuration?: {
    application: string;
  };
  id: string;
}
