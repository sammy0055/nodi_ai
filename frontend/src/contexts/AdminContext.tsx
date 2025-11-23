import { AdminUserService } from '../services/admin/AdminUserService';
import type { AdminUser } from '../types/users';
import { AdminSubscriptionPlanService } from '../services/admin/AdminSubscriptionPlanService';
import { AdminOrganziationService } from '../services/admin/AdminOrganizationService';

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
    const [requests] = await Promise.allSettled([getRequests({})]);

    const req = requests.status === 'fulfilled' ? requests.value : null;
    return { requests: req?.data };
  } catch (error: any) {
    console.error('error in Admin contextLoader:', error.message);
  }
};

export const adminSubscriptonLoader = async () => {
  const { getSubscriptionPlans } = new AdminSubscriptionPlanService();
  return await getSubscriptionPlans();
};

export const adminOrganizationStatisticsLoader = async () => {
  const { getOrganizationStatistics, adminGetOrganizations } = new AdminOrganziationService();
  const { getSubPlanStatistics } = new AdminSubscriptionPlanService();
  const [subPlanStats, OrgStats, organizations] = await Promise.allSettled([
    getSubPlanStatistics(),
    getOrganizationStatistics(),
    adminGetOrganizations(),
  ]);

  const subplan = subPlanStats.status === 'fulfilled' ? subPlanStats.value : null;
  const org = OrgStats.status === 'fulfilled' ? OrgStats.value : null;
  const adminOrganizations = organizations.status === 'fulfilled' ? organizations.value : null;
  return { organizations: { ...org?.data, plans: subplan?.data }, adminOrganizations };
};

export const adminConversationLoader = async () => {
  const { adminGetOrganizations } = new AdminOrganziationService();
  const [orgs] = await Promise.allSettled([adminGetOrganizations()]);
  const organizations = orgs.status === 'fulfilled' ? orgs.value : null;
  return organizations?.data;
};

export const adminNotificationLoader = async () => {
  const { getNotifications } = new AdminOrganziationService();
  const [notifications] = await Promise.allSettled([getNotifications()]);
  const _notifications = notifications.status === 'fulfilled' ? notifications.value : null;
  return _notifications?.data;
};

export const adminSettingsLoader = async () => {
  const { getAdminNotificationEmails } = new AdminOrganziationService();
  const [adminEmailList] = await Promise.allSettled([getAdminNotificationEmails()]);
  const _adminEmailList = adminEmailList.status === 'fulfilled' ? adminEmailList.value : null;
  return _adminEmailList?.data;
};
