import { SubscriptionPanService } from '../services/subscription-plan.service';
import { ISubscriptionPlan } from '../types/subscription-plan';

export class SubscriptionPlanController {
  static async createSubscriptionPlan(plan: ISubscriptionPlan) {
    return await SubscriptionPanService.createSubscriptionPlan(plan);
  }
  static async getSubscriptionPlans() {
    return await SubscriptionPanService.getSubscriptionPlans()
  }
}
