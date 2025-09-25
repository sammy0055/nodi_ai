import type { IOrganization } from '../types/organization';
import { ApiClient } from './apiClient';
import type { ExchangeCodeTypes } from '../types/whatsapp';

export class OrganizationService {
  constructor() {}

  async createOrganization(name: string, businessType: string): Promise<{ data: IOrganization; message: string }> {
    return await ApiClient('CREATE_ORGANIZATION', {
      method: 'POST',
      body: { name, businessType },
    });
  }

  async getOrganization(): Promise<{ data: IOrganization; message: string }> {
    return await ApiClient('GET_OGANIZATION');
  }

  async updateOrganization(data: IOrganization): Promise<{ data: IOrganization; message: string }> {
    return await ApiClient('UPDATE_ORGANIZATION', {
      method: 'POST',
      body: data,
    });
  }

  async exchangeCodeForAccessToken(data: ExchangeCodeTypes): Promise<{ data: any; message: string }> {
    return await ApiClient('EXCHANGE_WABA_CODE', {
      method: 'POST',
      body: data,
    });
  }
}
