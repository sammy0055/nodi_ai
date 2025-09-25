import { BusinessType } from '../data/data-types';
import { IWhatSappSettings } from './whatsapp-settings';

export interface IOrganization {
  id: string; // uuid
  name: string;
  brandTone: string;
  businessType: `${BusinessType}`;
  AIAssistantName:string
  Whatsappsettings?: IWhatSappSettings[];
}
