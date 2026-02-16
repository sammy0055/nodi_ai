import type { IBranchInventory } from '../types/branch';
import type { Pagination } from '../types/customer';
import { API_ROUTES, ApiClient } from './apiClient';

export class BranchInventoryService {
  constructor() {}

  async createInventory(data: IBranchInventory): Promise<{ data: IBranchInventory; message: string }> {
    const { id, ...restData } = data;
    return await ApiClient('CREATE_BRANCH_INVENTORY', {
      method: 'POST',
      body: restData,
    });
  }

  async updateInventory(data: IBranchInventory): Promise<{ data: IBranchInventory; message: string }> {
    return await ApiClient('UPDATE_BRANCH_INVENTORY', {
      method: 'POST',
      body: data,
    });
  }

  async deleteInventory(id: string) {
    const response = await fetch(`${API_ROUTES.DELETE_BRANCH_INVENTOTRY}/${id}`, {
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

  async getInventories(
    page?: number,
    searchTerm?: string
  ): Promise<{ data: { data: IBranchInventory[]; pagination: Pagination }; message: string }> {
    return await ApiClient('GET_BRANCH_INVENTORIES', {
      queryParams: `?page=${encodeURIComponent(page || 1)}&search=${encodeURIComponent(searchTerm || '')}`,
    });
  }

  async searchInvotory({
    search,
    branch,
    isActive,
    quantityOnHand,
    quantityReserved,
  }: {
    search?: string;
    branch?: string;
    isActive?: string;
    quantityReserved?: number;
    quantityOnHand?: number;
  }): Promise<{ data: { data: IBranchInventory[]; pagination: any }; message: string }> {
    const response = await fetch(
      `${API_ROUTES.GET_BRANCH_INVENTORIES}?search=${search}&branch=${encodeURIComponent(branch || '')}&isActive=${encodeURIComponent(isActive || '')}&quantityOnHand=${quantityOnHand}&quantityReserved=${quantityReserved}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

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
