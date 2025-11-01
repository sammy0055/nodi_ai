import type { ConversationAttributes } from '../../types/conversations';
import type { Pagination } from '../../types/customer';
import type { IOrganization } from '../../types/organization';
import { AdminApiClient } from '../apiClient';

export interface OrganizationStatisticsAttribute {
  total: string | null;
  status: {
    active: string | null;
    suspended: string | null;
    cancelled: string | null;
  };
}

export class AdminOrganziationService {
  async getOrganizationStatistics(): Promise<{
    data: OrganizationStatisticsAttribute;
  }> {
    return await AdminApiClient('GET_ORG_STATISTICS');
  }
  async adminGetOrganizations(): Promise<{ data: { data: IOrganization[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_ORGANIZATIONS');
  }
  async adminSearchOrganizations(
    searchTerm: string
  ): Promise<{ data: { data: IOrganization[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_ORGANIZATIONS', {
      queryParams: `?searchQuery=${searchTerm}`,
    });
  }
  async adminGetPaginatedOrganizations({
    page,
    searchTerm,
  }: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  }): Promise<{ data: { data: IOrganization[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_ORGANIZATIONS', {
      queryParams: `?page=${encodeURIComponent(page || 1)}&searchQuery=${encodeURIComponent(searchTerm || '')}`,
    });
  }
  async adminGetConversationsByOrgId({ page, organizationId }: { page?: number; organizationId: string }):Promise<{ data: { data: ConversationAttributes[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_CONVERSATIONS', {
      queryParams: `?page=${encodeURIComponent(page || 1)}&organizationId=${encodeURIComponent(organizationId)}`,
    });
  }
}
