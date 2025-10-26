import type { BaseRequestAttributes } from '../../types/request';
import type { AdminUser } from '../../types/users';
import { AdminApiClient, API_ROUTES } from '../apiClient';

export class AdminUserService {
  constructor() {}
  async login(email: string, password: string) {
    const res = await fetch(API_ROUTES.ADMIN_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'app-user-secret': import.meta.env.VITE_ADMIN_SECET,
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json()) as { data: any; errors: any };

    if (!res.ok) throw data;

    return data;
  }

  async fetchCurrentUser(): Promise<Promise<{ data: AdminUser; message: string }>> {
    return await AdminApiClient('CURRENT_ADMIN_USER');
  }

  async getRequests(): Promise<Promise<{ data: BaseRequestAttributes[]; message: string }>> {
    return await AdminApiClient('ADMIN_GET_REQUESTS');
  }

  async updateOrganizationWABA(data: any) {
    await AdminApiClient('ADMIN_UPDATE_ORG_WABA', {
      method: 'POST',
      body: data,
    });
  }

  async approveRequest(data: any) {
    await AdminApiClient('ADMIN_APPROVE_REQUEST', {
      method: 'POST',
      body: data,
    });
  }
}
