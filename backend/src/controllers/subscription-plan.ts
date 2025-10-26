import { SubscriptionPlanService } from '../services/subscription-plan.service';
import { ISubscriptionPlan } from '../types/subscription-plan';
import { AdminUser } from '../types/users';

export class SubscriptionPlanController {
  static async createSubscriptionPlan(plan: ISubscriptionPlan, user:AdminUser) {
    return await SubscriptionPlanService.createSubscriptionPlan(plan, user);
  }
   static async updateSubscriptionPlan(plan: ISubscriptionPlan, user:AdminUser) {
    return await SubscriptionPlanService.updateSubscriptionPlan(plan, user);
  }
  static async removeSubscriptionPlan(planId:string){
    await SubscriptionPlanService.deleteSubscriptionPlan(planId)
  }
  static async getSubscriptionPlans() {
    return await SubscriptionPlanService.getSubscriptionPlans()
  }
}
