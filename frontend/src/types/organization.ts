import type { BusinessType } from '../data/data-types';
import type { User } from './users';
import type { IWhatSappSettings } from './whatsapp';

export interface IOrganization {
  id: string; // uuid
  name: string;
  brandTone: string;
  businessType: `${BusinessType}`;
  AIAssistantName: string;
}

export interface OrganizationPayload extends IOrganization {
  whatsappsettings: IWhatSappSettings[];
  notifications: any[];
  Branches: any[];
  owner: User;
}
