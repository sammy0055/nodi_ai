import type { Customer, Pagination } from '../types/customer';
import { ApiClient } from './apiClient';

export class CustomerService {
  constructor() {}
  async getAllCustomers(
    page?: number,
    searchQuery?: string
  ): Promise<{ data: { data: Customer[]; pagination: Pagination }; message: string }> {
    return await ApiClient('GET_CUSTOMERS', {
      queryParams: `?page=${encodeURIComponent(page || 1)}&searchQuery=${encodeURIComponent(searchQuery || '')}`,
    });
  }

  async updateCustomerStatus(customer: Pick<Customer, 'status'>) {
    return await ApiClient('UPDATE_CUSTOMER_STATUS', { method: 'POST', body: customer });
  }
}
