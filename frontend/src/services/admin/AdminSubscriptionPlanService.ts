import type { ISubscriptionPlan } from '../../types/subscription';
import { ApiClient } from '../apiClient';

export class AdminSubscriptionPlanService {
  async getSubscriptionPlans(): Promise<{ data: ISubscriptionPlan }> {
    return await ApiClient('GET_SUBSCRIPTION_PLANS');
  }
}
