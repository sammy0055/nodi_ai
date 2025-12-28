import type { BusinessType } from '../data/data-types';
import type { CurrencyCode } from './product';
import type { User } from './users';
import type { IWhatSappSettings } from './whatsapp';

export interface OrgReviewQuestions {
  id: string;
  question: string;
  answer: string | null;
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
  reviewTimer: number | null;
}

export interface OrganizationPayload extends IOrganization {
  whatsappsettings: IWhatSappSettings[];
  notifications: any[];
  Branches: any[];
  owner: User;
}
