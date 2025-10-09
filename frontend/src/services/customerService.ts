import type { Customer, Pagination } from '../types/customer';
import { ApiClient } from './apiClient';

export class CustomerService {
  constructor() {}
  async getAllCustomers(): Promise<{ data: { data: Customer[]; pagination: Pagination }; message: string }> {
    return await ApiClient('GET_CUSTOMERS');
  }
}
