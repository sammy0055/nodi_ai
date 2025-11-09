import type { IArea, IBranch, IZone } from '../types/branch';
import type { Pagination } from '../types/customer';
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

  async getBranches(page?: number): Promise<{ data: { data: IBranch[]; pagination: Pagination }; message: string }> {
    return await ApiClient('GET_BRANCHES', { queryParams: `?page=${encodeURIComponent(page || 1)}` });
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

  async searchBranch(
    searchTerm: string
  ): Promise<{ data: { data: IBranch[]; pagination: Pagination }; message: string }> {
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

  async createZone(data: { name: string }): Promise<{ data: IZone; message: string }> {
    return await ApiClient('CREATE_ZONE', {
      method: 'POST',
      body: data,
    });
  }

  async getZones(page?: number): Promise<{ data: { data: IZone[]; pagination: Pagination }; message: string }> {
    return await ApiClient('GET_ZONES', { queryParams: `?page=${encodeURIComponent(page || 1)}` });
  }

  async updateZone(data: any): Promise<{ data: IZone; message: string }> {
    return await ApiClient('UPDATE_ZONE', { method: 'POST', body: data });
  }
  async deleteZone(zoneId: string) {
    const response = await fetch(`${API_ROUTES.DELETE_ZONE}?zoneId=${zoneId}`, {
      method: 'DELETE',
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

  async searchZones(searchTerm: string): Promise<{ data: { data: IZone[]; pagination: Pagination }; message: string }> {
    const response = await fetch(`${API_ROUTES.GET_ZONES}?search=${searchTerm}`, {
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

  async createArea(data: IArea): Promise<{ data: IArea; message: string }> {
    return await ApiClient('CREATE_AREA', { method: 'POST', body: data });
  }
  async getAreas(page?: number): Promise<{ data: { data: IArea[]; pagination: Pagination }; message: string }> {
    return await ApiClient('GET_AREAS', { queryParams: `?page=${encodeURIComponent(page || 1)}` });
  }
  async updateArea(data: IArea): Promise<{ data: IArea; message: string }> {
    const response = await fetch(`${API_ROUTES.UPDATE_AREA}/${data.id}`, {
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

  async deleteArea(id: string) {
    const response = await fetch(`${API_ROUTES.DELETE_AREA}/${id}`, {
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

    return await response.json();
  }

  async searchAreas(searchTerm: string): Promise<{ data: { data: IArea[]; pagination: Pagination }; message: string }> {
    const response = await fetch(`${API_ROUTES.GET_AREAS}?search=${searchTerm}`, {
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
