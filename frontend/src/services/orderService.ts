import type { IOrder } from '../pages/tenant/OrderPage';
import { ApiClient } from './apiClient';

export class OrderService {
  async getOrders(): Promise<{ data: { data: IOrder[] }; message: string }> {
    return await ApiClient('GET_ORDERS');
  }
  async updateOrderStatus(data: { orderId: string; status: string }) {
    return await ApiClient('UPDATE_ORDER_STATUS', {
      method: 'POST',
      body: data,
    });
  }
}
