import type { Permission, Role, User } from '../types/users';
import { ApiClient } from './apiClient';

export class UserService {
  constructor() {}
  async fetchCurrentUser(): Promise<Promise<{ data: User; message: string }>> {
    return await ApiClient('CURRENT_USER');
  }

  async addUser(user: User): Promise<Promise<{ data: User; message: string }>> {
    return await ApiClient('ADD_USER', {
      method: 'POST',
      body: user,
    });
  }

  async getUsers(): Promise<Promise<{ data: User[]; message: string }>> {
    return await ApiClient('GET_USERS');
  }

  async getRoles(): Promise<Promise<{ data: Role[]; message: string }>> {
    return await ApiClient('GET_ROLES');
  }

  async getPermissions(): Promise<Promise<{ data: Permission[]; message: string }>> {
    return await ApiClient('GET_PERMISSIONS');
  }

  async setRolePermissions(data: { permIds: string[]; role: string }) {
    return await ApiClient('SET_ROLE_PERMISSIONS', {
      method: 'POST',
      body: data,
    });
  }

  async deleteUser(userId: string) {
    return await ApiClient('DELETE_USER', {
      method: 'DELETE',
      body: { userId },
    });
  }

  async updateUser(user: User): Promise<Promise<{ data: User; message: string }>> {
    return await ApiClient('UPDATE_USER', {
      method: 'POST',
      body: user,
    });
  }

  async logout() {
    await ApiClient('LOGOUT', { method: 'POST' });
  }
}
