import type { BusinessType } from '../data/data-types';
import type { CurrencyCode } from './product';
import type { User } from './users';
import type { IWhatSappSettings } from './whatsapp';

export interface OrgReviewQuestions {
  id: string;
  question: string;
  answer: string | null;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceSchedule {
  dayOfWeek: string;
  hours: { open: string; close: string }[];
}

export interface IOrganization {
  id: string; // uuid
  name: string;
  brandTone: string;
  businessType: `${BusinessType}`;
  AIAssistantName: string;
  languageProtectedTerms?: string[];
  currency: CurrencyCode;
  status: 'active' | 'suspended' | 'cancelled';
  reviewQuestions: OrgReviewQuestions[];
  frequentlyAskedQuestions: FAQItem[];
  serviceSchedule: ServiceSchedule[];
  reviewTimer: number | null;
}

export interface OrganizationPayload extends IOrganization {
  whatsappsettings: IWhatSappSettings[];
  notifications: any[];
  Branches: any[];
  owner: User;
}
