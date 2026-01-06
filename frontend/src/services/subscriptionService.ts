import type { ISubscriptionPlan } from '../types/subscription';
import { AdminApiClient, ApiClient } from './apiClient';

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

  async adminCreateSubscription(data: { creditPoint: number; orgId: string }) {
    return await AdminApiClient('ADMIN_CREATE_ORG_SUB', {
      method: 'POST',
      body: data,
    });
  }

  async addCreditPoint(data: { creditPoint: number; organizationId: string }) {
    return await AdminApiClient('ADMIN_ADD_ORG_CREDIT', {
      method: 'POST',
      body: data,
    });
  }

  async adminCancelSubscription(data: { subId: string; orgId: string }) {
    return await AdminApiClient('ADMIN_CANCEL_ORG_SUB', {
      method: 'DELETE',
      body: data,
    });
  }
}
