import type { Pagination } from '../types/customer';
import type { Product, ProductOption, ProductOptionChoice } from '../types/product';
import { API_ROUTES, ApiClient } from './apiClient';

export class ProductService {
  constructor() {}
  async addProduct(data: Product): Promise<{ data: Product; message: string }> {
    const formData = new FormData();
    formData.append('file', data.file!);
    formData.append('name', data.name);
    formData.append('price', String(data.price));
    formData.append('currency', String(data.currency));
    formData.append('description', data.description);
    const response = await fetch(API_ROUTES.ADD_PRODUCT, {
      method: 'POST',
      body: formData,
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

  async updateProduct(data: Product) {
    const formData = new FormData();
    formData.append('file', data.file!);
    formData.append('name', data.name);
    formData.append('price', String(data.price));
    formData.append('description', data.description);
    formData.append('currency', data.currency);
    formData.append('status', data.status);
    formData.append('sku', data.sku);
    const response = await fetch(`${API_ROUTES.UPDATE_PRODUCT}/${data.id}`, {
      method: 'PUT',
      body: formData,
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
  async getProducts(
    page?: number,
    searchTerm?: string
  ): Promise<{ data: { data: Product[]; pagination: Pagination }; message: string }> {
    return await ApiClient('GET_PRODUCTS', {
      queryParams: `?page=${encodeURIComponent(page || 1)}&searchQuery=${encodeURIComponent(searchTerm || '')}`,
    });
  }
  async searchProducts(searchTerm: string): Promise<{ data: { data: Product[] }; message: string }> {
    const response = await fetch(`${API_ROUTES.GET_PRODUCTS}?searchQuery=${searchTerm}`, {
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
  async deleteProduct(productId: string) {
    await fetch(`${API_ROUTES.UPDATE_PRODUCT}/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  }

  async getProductOptions(productIds: string[]): Promise<{ data: { data: Product[] }; message: string }> {
    return await ApiClient('GET_PRODUCT_OPTIONS', { method: 'POST', body: { productIds: productIds || [] } });
  }

  async addProductOption(data: ProductOption): Promise<{ data: ProductOption; message: string }> {
    const { id, choices, ...restDAta } = data;
    return await ApiClient('ADD_PRODUCT_OPTION', { method: 'POST', body: restDAta });
  }

  async updateProductOption(data: any): Promise<{ data: ProductOption; message: string }> {
    return await ApiClient('UPDATE_PRODUCT_OPTION', { method: 'POST', body: data });
  }

  async deleteProductOption(id: string) {
    await fetch(`${API_ROUTES.DELETE_PRODUCT_OPTIONS}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  async addProductOptionChoice(data: ProductOptionChoice): Promise<{ data: ProductOptionChoice; message: string }> {
    const { id, ...restDAta } = data;
    return await ApiClient('APP_PRODUCT_OPTION_CHOICE', { method: 'POST', body: restDAta });
  }

  async updateProductChoice(data: any): Promise<{ data: ProductOption; message: string }> {
    return await ApiClient('UPDATE_PRODUCT_CHOICE', { method: 'POST', body: data });
  }
  async deleteProductChoice(id: string) {
    await fetch(`${API_ROUTES.DELETE_PRODUCT_CHOICE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  async syncMetaCatalogToDB() {
    return await ApiClient('SYNC_CATALOG_TO_DB', { method: 'GET' });
  }
}
