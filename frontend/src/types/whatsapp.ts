import type { WhatSappConnectionStatus } from '../data/data-types';

export interface IWhatSappSettings {
  id: string;
  organizationId: string | null;
  whatsappBusinessId: string;
  whatsappPhoneNumberIds: string[];
  connectionStatus: `${WhatSappConnectionStatus}`;
  isSubscribedToWebhook: boolean;
  whatsappTemplates: string[];
  catalogId?: string;
}

// FB SDK Login Response
export interface FbSdkAuthResponse {
  userID: string | null;
  expiresIn: number | null;
  code: string; // always returned when response_type=code
}

export interface FbSdkResponse {
  authResponse: FbSdkAuthResponse | null;
  status: 'connected' | 'not_authorized' | 'unknown';
}

// WhatsApp Embedded Signup Message
export interface WaEmbeddedSignupData {
  phone_number_id: string;
  waba_id: string;
  business_id: string;
}

export type WaEmbeddedSignupEvent = 'FINISH' | 'CANCEL' | 'ERROR';

export interface WaEmbeddedSignupResponse {
  data: WaEmbeddedSignupData;
  type: 'WA_EMBEDDED_SIGNUP';
  event: WaEmbeddedSignupEvent;
  version: string;
}

export interface ExchangeCodeTypes {
  code: string;
  whatsappBusinessId: string;
  whatsappPhoneNumberId: string;
}
