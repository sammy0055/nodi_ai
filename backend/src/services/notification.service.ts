import { NotificationModel } from '../models/notification.model';
import { Pagination } from '../types/common-types';

interface NotificationFilters {
  status?: string;
  priority?: string;
  relatedEntityType?: string;
}
export class NotificationService {
  static async markNotificationAsRead(notificationId: string) {
    if (!notificationId) throw new Error('notification id was not provided for mark as read action');
    await NotificationModel.update({ status: 'read', readAt: new Date() }, { where: { id: notificationId } });
  }

  static async deleteNotification(notificationId: string) {
    if (!notificationId) throw new Error('notification id was not provided for delete action');
    await NotificationModel.destroy({ where: { id: notificationId } });
  }
  static async getNotifications(filters: NotificationFilters, { offset, limit, page }: Pagination) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.relatedEntityType) where.relatedEntityType = filters.relatedEntityType;

    const { rows: notifications, count: totalItemsRaw } = await NotificationModel.findAndCountAll({
      where,
      offset,
      limit,
    });

    // totalItems from Sequelize can be number or object depending on dialect; ensure numeric
    const totalItems = typeof totalItemsRaw === 'number' ? totalItemsRaw : (totalItemsRaw as any).count || 0;
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
    return {
      data: notifications,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
