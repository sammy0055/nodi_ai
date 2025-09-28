import type { ISubscriptionPlan } from '../types/subscription';
import { ApiClient } from './apiClient';

export class SubscriptionService {
  async getSubscriptionPlans(): Promise<{ data: ISubscriptionPlan; message: string }> {
    return await ApiClient('GET_SUBSCRIPTION_PLANS');
  }
  async getSubscription(): Promise<{ data: ISubscriptionPlan; message: string }> {
    return await ApiClient('GET_SUBSCRIPTION');
  }
  async getCrediteBalance(): Promise<{ data: ISubscriptionPlan; message: string }> {
    return await ApiClient('GET_CREDIT_BALANCE');
  }
  async getCreditUsage(): Promise<{ data: ISubscriptionPlan; message: string }> {
    return await ApiClient('GET_CREDIT_USAGE');
  }
  async createSubscription(data: { planId: string }): Promise<{ data: { url: string }; message: string }> {
    return await ApiClient('SUBSCRIBE_TO_PLAN', { method: 'POST', body: data });
  }
  async upgradeSubscription(data: { planId: string }): Promise<{ data: { url: string }; message: string }> {
    return await ApiClient('UPGRADE_SUBSCRIPTION_PLAN', { method: 'POST', body: data });
  }
}
