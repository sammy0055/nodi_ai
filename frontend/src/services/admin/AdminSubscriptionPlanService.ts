import type { CreateSubscriptionPlanAttributes, ISubscriptionPlan } from '../../types/subscription';
import { AdminApiClient } from '../apiClient';

export class AdminSubscriptionPlanService {
  async getSubscriptionPlans(): Promise<{ data: ISubscriptionPlan }> {
    return await AdminApiClient('GET_SUBSCRIPTION_PLANS');
  }

  async createSubscriptionPlan(
    data: Omit<CreateSubscriptionPlanAttributes, 'id'>
  ): Promise<{ data: ISubscriptionPlan }> {
    return await AdminApiClient('CREATE_SUBSCRIPTION_PLAN', {
      method: 'POST',
      body: data,
    });
  }

  async updateSubscriptionPlan(data: CreateSubscriptionPlanAttributes): Promise<{ data: ISubscriptionPlan }> {
    return await AdminApiClient('UPDATE_SUBSCRIPTION_PLAN', {
      method: 'POST',
      body: data,
    });
  }

  async deleteSubscriptionPlan(planId: string) {
    await AdminApiClient('DELETE_SUBSCRIPTION_PLAN', {
      method: 'DELETE',
      body: { planId },
    });
  }
}
