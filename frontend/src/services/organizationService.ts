import type { FAQItem, IOrganization } from '../types/organization';
import { API_ROUTES, ApiClient } from './apiClient';
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
    const response = await fetch(`${API_ROUTES.GET_REQUST}?requestType=${requestType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = `${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        throw new Error(errorMessage);
      }
    }

    return await response.json();
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

  async setOrgFQAQuestions(data: FAQItem[]): Promise<{ data: IOrganization; message: string }> {
    return await ApiClient('SET_ORG_FQA_QUESTIONS', {
      method: 'POST',
      body: data,
    });
  }
}
