import { SubscriptionService } from '../services/subscription.service';
import { User } from '../types/users';

export class SubscriptionController {
  static async subscribeToPlan(planId: string, user: Pick<User, 'id' | 'organizationId'>) {
    return await SubscriptionService.subscribeToPlan(planId, user);
  }
  static async upgradeSubscription(planId: string, user: Pick<User, 'id' | 'organizationId'>) {
    return await SubscriptionService.upgradeSubscription(planId, user);
  }
  static async getSubscripton(user: Pick<User, 'id' | 'organizationId'>) {
    return await SubscriptionService.getSubscripton(user);
  }
  static async getCreditUsage(user: Pick<User, 'id' | 'organizationId'>) {
    return await SubscriptionService.getCreditUsage(user);
  }
  static async getCreditBalance(user: Pick<User, 'id' | 'organizationId'>) {
    return await SubscriptionService.getCreditBalance(user);
  }
}
