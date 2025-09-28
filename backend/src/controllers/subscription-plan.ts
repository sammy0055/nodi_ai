import { SubscriptionPanService } from '../services/subscription-plan.service';
import { ISubscriptionPlan } from '../types/subscription-plan';
import { AdminUser } from '../types/users';

export class SubscriptionPlanController {
  static async createSubscriptionPlan(plan: ISubscriptionPlan, user:AdminUser) {
    return await SubscriptionPanService.createSubscriptionPlan(plan, user);
  }
  static async getSubscriptionPlans() {
    return await SubscriptionPanService.getSubscriptionPlans()
  }
}
