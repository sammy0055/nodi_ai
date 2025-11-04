import type { NotificationAttributes } from '../../pages/admin/NotificationsPage';
import type { NotificationEmail } from '../../pages/admin/SettingsPage';
import type { ConversationAttributes } from '../../types/conversations';
import type { Pagination } from '../../types/customer';
import type { IOrganization } from '../../types/organization';
import { AdminApiClient } from '../apiClient';

export interface OrganizationStatisticsAttribute {
  total: string | null;
  status: {
    active: string | null;
    suspended: string | null;
    cancelled: string | null;
  };
}

export class AdminOrganziationService {
  async getOrganizationStatistics(): Promise<{
    data: OrganizationStatisticsAttribute;
  }> {
    return await AdminApiClient('GET_ORG_STATISTICS');
  }
  async adminGetOrganizations(): Promise<{ data: { data: IOrganization[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_ORGANIZATIONS');
  }
  async adminSearchOrganizations(
    searchTerm: string
  ): Promise<{ data: { data: IOrganization[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_ORGANIZATIONS', {
      queryParams: `?searchQuery=${searchTerm}`,
    });
  }
  async adminGetPaginatedOrganizations({
    page,
    searchTerm,
  }: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  }): Promise<{ data: { data: IOrganization[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_ORGANIZATIONS', {
      queryParams: `?page=${encodeURIComponent(page || 1)}&searchQuery=${encodeURIComponent(searchTerm || '')}`,
    });
  }

  async adminGetConversationsByOrgId({
    page,
    organizationId,
  }: {
    page?: number;
    organizationId: string;
  }): Promise<{ data: { data: ConversationAttributes[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_CONVERSATIONS', {
      queryParams: `?page=${encodeURIComponent(page || 1)}&organizationId=${encodeURIComponent(organizationId)}`,
    });
  }

  async getNotifications(): Promise<{ data: { data: NotificationAttributes[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_NOTIFICATIONS');
  }

  async getFilteredNotifications(
    args: NotificationAttr
  ): Promise<{ data: { data: NotificationAttributes[]; pagination: Pagination } }> {
    return await AdminApiClient('ADMIN_GET_NOTIFICATIONS', {
      queryParams: `?page=${encodeURIComponent(args.page || 1)}&status=${encodeURIComponent(
        args.status || ''
      )}&priority=${encodeURIComponent(args.priority || '')}&relatedEntityType=${encodeURIComponent(
        args.relatedEntityType || ''
      )}`,
    });
  }

  async markNotificationAsRead(notificationId: string) {
    await AdminApiClient('ADMIN_MARK_NOTIFICATION_AS_READ', {
      queryParams: `?notificationId=${encodeURIComponent(notificationId || '')}`,
      method: 'POST',
    });
  }

  async deleteNotification(notificationId: string) {
    await AdminApiClient('ADMIN_DELETE_NOTIFICATIONS', {
      queryParams: `?notificationId=${encodeURIComponent(notificationId || '')}`,
      method: 'DELETE',
    });
  }

  async getAdminNotificationEmails(): Promise<{ data: NotificationEmail[] }> {
    return AdminApiClient('ADMIN_GET_NOTIFICATION_EMAILS');
  }

  async addNotificationEmail(email: string): Promise<{ data: NotificationEmail }> {
    return AdminApiClient('ADMIN_ADD_NOTIFICATION_EMAIL', {
      method: 'POST',
      body: { email: email },
    });
  }

  async verifyNotificationEmail(emailId: string, code: string): Promise<{ data: NotificationEmail }> {
    return AdminApiClient('ADMIN_VERIFY_NOTIFICATION_EMAIL', {
      method: 'POST',
      body: { emailId, code },
    });
  }

  async deleteAdminNotificationEmail(emailId: string) {
    await AdminApiClient('ADMIN_DELETE_NOTIFICATION_EMAIL', {
      method: 'DELETE',
      queryParams: `?emailId=${emailId}`,
    });
  }
}

interface NotificationAttr {
  page?: number;
  status?: string;
  priority?: string;
  relatedEntityType?: string;
}
