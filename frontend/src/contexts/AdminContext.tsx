import { AdminUserService } from '../services/admin/AdminUserService';
import type { AdminUser } from '../types/users';
import type { BaseRequestAttributes } from '../types/request';
import { AdminSubscriptionPlanService } from '../services/admin/AdminSubscriptionPlanService';

export const adminLayoutLoader = async () => {
  try {
    const { fetchCurrentUser } = new AdminUserService();
    const [userResult] = await Promise.allSettled([fetchCurrentUser()]);
    const user = userResult.status === 'fulfilled' ? userResult.value : null;
    return { user: user?.data } as { user: AdminUser };
  } catch (error: any) {
    console.error('error in Admin contextLoader:', error.message);
  }
};

export const adminRequestLoader = async () => {
  try {
    const { getRequests } = new AdminUserService();
    const [requests] = await Promise.allSettled([getRequests()]);

    const req = requests.status === 'fulfilled' ? requests.value : null;
    return { requests: req?.data } as { requests: BaseRequestAttributes[] };
  } catch (error: any) {
    console.error('error in Admin contextLoader:', error.message);
  }
};

export const adminSubscriptonLoader = async () => {
  const { getSubscriptionPlans } = new AdminSubscriptionPlanService();
  return await getSubscriptionPlans();
};
