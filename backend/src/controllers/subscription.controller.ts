import { SubscriptionService } from '../services/subscription.service';
import { User } from '../types/users';

export class SubscriptionController {
  static async subscribeToPlan(planId: string, user: Pick<User, 'id' | 'organizationId'>) {
    return await SubscriptionService.subscribeToPlan(planId, user);
  }
}
