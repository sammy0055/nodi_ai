import { BusinessType } from '../data/data-types';
import { CurrencyCode } from './product';
import { IWhatSappSettings } from './whatsapp-settings';

export interface OrgReviewQuestions {
  id: string;
  question: string;
  answer: string | null;
}

export interface IReviews {
  id: string; // uuid
  organizationId: string;
  customerId: string;
  orderId: string;
  rating: number; //scale of 1 to 5
  items: OrgReviewQuestions[];
}

export interface IOrganization {
  id: string; // uuid
  name: string;
  brandTone: string;
  businessType: `${BusinessType}`;
  AIAssistantName: string;
  Whatsappsettings?: IWhatSappSettings[];
  stripeCustomerId?: string;
  shouldUpdateChatbotSystemPrompt?: boolean;
  status: 'active' | 'suspended' | 'cancelled';
  languageProtectedTerms?: string[];
  currency: CurrencyCode;
  reviewQuestions: OrgReviewQuestions[];
}
