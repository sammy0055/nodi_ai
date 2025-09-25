import type { BaseRequestAttributes } from '../../types/request';
import type { AdminUser } from '../../types/users';
import { API_ROUTES, ApiClient } from '../apiClient';

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
    return await ApiClient('CURRENT_ADMIN_USER', {
      headers: {
        'app-user-secret': import.meta.env.VITE_ADMIN_SECET,
      },
    });
  }

  async getRequests(): Promise<Promise<{ data: BaseRequestAttributes; message: string }>> {
    return await ApiClient("ADMIN_GET_REQUESTS", {
      headers: {
        'app-user-secret': import.meta.env.VITE_ADMIN_SECET,
      },
    });
  }
}
