import type { IBranch } from '../types/branch';
import { API_ROUTES, ApiClient } from './apiClient';

export class BranchService {
  constructor() {}
  async createBranch(data: IBranch): Promise<{ data: IBranch; message: string }> {
    const { id, ...restData } = data;
    return await ApiClient('CREATE_BRANCH', {
      method: 'POST',
      body: restData,
    });
  }

  async getBranches(): Promise<{ data: { data: IBranch[]; pagination: any }; message: string }> {
    return await ApiClient('GET_BRANCHES');
  }

  async updateBranch(data: IBranch): Promise<{ data: IBranch; message: string }> {
    const response = await fetch(`${API_ROUTES.UPDATE_BRANCH}/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
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

  async deleteBranch(id: string) {
    const response = await fetch(`${API_ROUTES.DELETE_BRANCH}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
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
  }

  async searchBranch(searchTerm: string): Promise<{ data: { data: IBranch[]; pagination: any }; message: string }> {
    const response = await fetch(`${API_ROUTES.GET_BRANCHES}?search=${searchTerm}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
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
}
