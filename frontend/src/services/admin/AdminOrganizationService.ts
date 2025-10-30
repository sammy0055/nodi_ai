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
  }: {
    page?: number;
    limit?: number;
  }): Promise<{ data: { data: IOrganization[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_ORGANIZATIONS', {
      queryParams: `?page=${page}`,
    });
  }
}
