import type { IOrder } from '../pages/tenant/OrderPage';
import type { Pagination } from '../types/customer';
import { ApiClient } from './apiClient';

interface GetOrderParams {
  page?: number;
  searchTerm?: string;
  status?: string;
}
export class OrderService {
  async getOrders({
    searchTerm,
    page,
    status,
  }: GetOrderParams): Promise<{ data: { data: IOrder[]; pagination: Pagination }; message: string }> {
    return await ApiClient('GET_ORDERS', {
      queryParams: `?search=${encodeURIComponent(searchTerm || '')}&page=${page || 1}&status=${encodeURIComponent(
        status || ''
      )}`,
    });
  }

  async getAssignedOrders({
    page,
    status,
  }: GetOrderParams): Promise<{ data: { data: IOrder[]; pagination: Pagination }; message: string }> {
    return await ApiClient("GET_ASSIGNED_ORDERS", {
      queryParams: `?page=${page || 1}&status=${encodeURIComponent(status || '')}`,
    });
  }

  async updateOrderStatus(data: { orderId: string; status: string }) {
    return await ApiClient('UPDATE_ORDER_STATUS', {
      method: 'POST',
      body: data,
    });
  }

  async updateOrder(data: IOrder): Promise<{ data: IOrder }> {
    return await ApiClient('UPDATE_ORDER', {
      method: 'POST',
      body: data,
    });
  }
}
