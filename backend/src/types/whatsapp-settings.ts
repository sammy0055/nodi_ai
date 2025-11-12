import { WhatSappConnectionStatus } from '../data/data-types';
import { User } from './users';

export interface IWhatSappSettings {
  id: string;
  organizationId: string | null;
  whatsappBusinessId: string;
  whatsappPhoneNumberId: string;
  whatsappPhoneNumber: string;
  connectionStatus: `${WhatSappConnectionStatus}`;
  accessToken: string | null;
  token_type: string | null;
  isSubscribedToWebhook: boolean;
  whatsappTemplates: string[];
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
