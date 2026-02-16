import type { FAQItem, IOrganization, ServiceSchedule } from '../types/organization';
import { ApiClient } from './apiClient';
import type { ExchangeCodeTypes } from '../types/whatsapp';
import type { BaseRequestAttributes } from '../types/request';

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

  async getOrganizationRequest(
    requestType: 'CatalogRequest' | 'ProductRequest' | 'OrderRequest'
  ): Promise<{ data: BaseRequestAttributes; message: string }> {
    return await ApiClient('GET_REQUST', { method: 'GET', queryParams: `?requestType=${requestType}` });
  }

  async requestCatalogCreation(data: BaseRequestAttributes): Promise<{ data: BaseRequestAttributes; message: string }> {
    return await ApiClient('CREATE_CATALOG_REQUEST', {
      method: 'POST',
      body: data,
    });
  }

  async publishWhatsappTemplates(): Promise<{ data: any; message: string }> {
    return await ApiClient('PUBLISH_WHATSAPP_TEMPLATE', { method: 'POST' });
  }

  async removeWhatsappSettings() {
    return await ApiClient('REMOVE_WHATSAPP_SETTINGS', { method: 'DELETE' });
  }

  async setOrgFQAQuestions(data: FAQItem[]): Promise<{ data: IOrganization; message: string }> {
    return await ApiClient('SET_ORG_FQA_QUESTIONS', {
      method: 'POST',
      body: data,
    });
  }

  async setOrgServiceSchedule(
    serviceSchedules: ServiceSchedule[],
    timeZone: string
  ): Promise<{ data: IOrganization; message: string }> {
    return await ApiClient('SET_ORG_SERVICE_SCHEDULE', {
      method: 'POST',
      body: { serviceSchedules, timeZone },
    });
  }
}
