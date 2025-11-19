import type { User } from '../types/users';
import { ApiClient } from './apiClient';

export class UserService {
  constructor() {}
  async fetchCurrentUser(): Promise<Promise<{ data: User; message: string }>> {
    return await ApiClient('CURRENT_USER');
  }

  async logout() {
    await ApiClient('LOGOUT', { method: 'POST' });
  }
}
