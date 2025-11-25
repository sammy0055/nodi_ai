export enum CustomerSourceTypes {
  CHATBOT = 'chatbot',
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  API = 'api',
}

export interface ICustomer {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  source: `${CustomerSourceTypes}`;
  totalOrders?: number;
  preferences?: Record<string, any>;
  status: 'suspended' | 'active' | 'inactive';
}
