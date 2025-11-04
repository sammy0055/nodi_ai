import React, { useState, useEffect } from 'react';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiUser,
  FiShoppingBag,
  FiCreditCard,
  FiSettings,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useLoaderData } from 'react-router';
import type { Pagination } from '../../types/customer';
import { AdminOrganziationService } from '../../services/admin/AdminOrganizationService';

// Types based on your schema
export const NotificationStatus = {
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived',
  DISMISSED: 'dismissed',
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const RelatedNotificationEntity = {
  ORDER: 'order',
  USER: 'user',
  SYSTEM: 'system',
  BILLING: 'billing',
  SUBSCRIPTION: 'subscription',
  ORGANIZATION: 'organization',
} as const;
export type RelatedNotificationEntity = (typeof RelatedNotificationEntity)[keyof typeof RelatedNotificationEntity];

export const NotificationPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;
export type NotificationPriority = (typeof NotificationPriority)[keyof typeof NotificationPriority];

export interface NotificationAttributes {
  id: string;
  organizationId: string | null;
  senderUserId?: string | null;
  recipientType: 'tenant' | 'admin';
  title: string;
  message: string;
  status: `${NotificationStatus}`;
  relatedEntityType: `${RelatedNotificationEntity}`;
  priority: NotificationPriority;
  readAt?: Date | null;
  createdAt: Date;
}

const NotificationsPage: React.FC = () => {
  const data = useLoaderData() as { data: NotificationAttributes[]; pagination: Pagination };
  const [notifications, setNotifications] = useState<NotificationAttributes[]>(data.data);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RelatedNotificationEntity | 'all'>('all');
  const [pagination, setPagination] = useState<Pagination>(data.pagination);
  const [isLoading, setIsLoading] = useState(false);

  // Server-side filtering - fetch filtered data from API
  const {
    getFilteredNotifications,
    markNotificationAsRead,
    deleteNotification: _deleteNotification,
  } = new AdminOrganziationService();

  const fetchNotifications = async (page: number, resetData: boolean = false) => {
    try {
      setIsLoading(true);

      // Build filters for API call
      const filters: any = { page };

      if (filter !== 'all') {
        filters.status = filter;
      }
      if (priorityFilter !== 'all') {
        filters.priority = priorityFilter;
      }
      if (typeFilter !== 'all') {
        filters.relatedEntityType = typeFilter;
      }

      const { data: responseData } = await getFilteredNotifications(filters);

      if (resetData) {
        // Replace notifications when filters change or first page
        setNotifications(responseData.data);
      } else {
        // Append notifications when loading more pages
        setNotifications((prev) => [...prev, ...responseData.data]);
      }

      setPagination(responseData.pagination);
    } catch (error: any) {
      alert('Something went wrong, try again later');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pagination
  const handlePagination = async (page: number) => {
    await fetchNotifications(page, page === 1);
  };

  // Reset to first page and refetch when filters change
  useEffect(() => {
    handlePagination(1);
  }, [filter, priorityFilter, typeFilter]);

  // Calculate display counts based on current page data
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endIndex = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, isRead: true, readAt: new Date(), status: NotificationStatus.READ }
            : notif
        )
      );
    } catch (error: any) {
      alert('something went wrong, try again later');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await _deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    } catch (error: any) {
      alert('something went wrong, try again later');
    }
  };

  // Get priority color and icon
  const getPriorityInfo = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <FiAlertCircle className="text-red-600" />,
          text: 'Urgent',
        };
      case NotificationPriority.HIGH:
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <FiAlertTriangle className="text-orange-600" />,
          text: 'High',
        };
      case NotificationPriority.MEDIUM:
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <FiInfo className="text-yellow-600" />,
          text: 'Medium',
        };
      case NotificationPriority.LOW:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <FiInfo className="text-blue-600" />,
          text: 'Low',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <FiInfo className="text-gray-600" />,
          text: 'Unknown',
        };
    }
  };

  // Get entity type icon
  const getEntityIcon = (entityType: RelatedNotificationEntity) => {
    switch (entityType) {
      case RelatedNotificationEntity.ORDER:
        return <FiShoppingBag className="text-purple-600" />;
      case RelatedNotificationEntity.USER:
        return <FiUser className="text-green-600" />;
      case RelatedNotificationEntity.SYSTEM:
        return <FiSettings className="text-blue-600" />;
      case RelatedNotificationEntity.BILLING:
        return <FiCreditCard className="text-orange-600" />;
      case RelatedNotificationEntity.SUBSCRIPTION:
        return <FiBell className="text-indigo-600" />;
      case RelatedNotificationEntity.ORGANIZATION:
        return <FiUser className="text-cyan-600" />;
      default:
        return <FiInfo className="text-gray-600" />;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Count unread notifications from current loaded data
  const unreadCount = notifications.filter((notif) => notif.status !== 'read').length;

  // Notification Item Component
  const NotificationItem: React.FC<{ notification: NotificationAttributes }> = ({ notification }) => {
    const priorityInfo = getPriorityInfo(notification.priority);
    const entityIcon = getEntityIcon(notification.relatedEntityType);

    return (
      <div
        className={`p-4 border-l-4 transition-all duration-200 ${
          notification.status === 'read'
            ? 'bg-white border-l-neutral-200 hover:bg-neutral-50'
            : 'bg-blue-50 border-l-blue-500 hover:bg-blue-100'
        }`}
      >
        <div className="flex items-start space-x-3">
          {/* Entity Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg border border-neutral-200 flex items-center justify-center">
            {entityIcon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3
                  className={`font-semibold ${
                    notification.status === 'read' ? 'text-neutral-700' : 'text-neutral-900'
                  }`}
                >
                  {notification.title}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priorityInfo.color}`}
                >
                  {priorityInfo.icon}
                  <span className="ml-1 hidden sm:inline">{priorityInfo.text}</span>
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-2">
                {/* Time */}
                <div className="flex items-center text-xs text-neutral-500">
                  <FiClock className="mr-1" size={12} />
                  <span>{formatDate(notification.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  {notification.status !== 'read' && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-neutral-400 hover:text-green-600 transition-colors"
                      title="Mark as read"
                    >
                      <FiCheckCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                    title="Delete notification"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-neutral-600 mb-2">{notification.message}</p>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              {notification.organizationId && (
                <span className="inline-flex items-center">
                  <FiUser className="mr-1" size={12} />
                  Org: {notification.organizationId}
                </span>
              )}
              <span className="inline-flex items-center capitalize">
                {notification.relatedEntityType.replace('_', ' ')}
              </span>
              {notification.status === 'read' && notification.readAt && (
                <span className="inline-flex items-center">
                  <FiCheck className="mr-1" size={12} />
                  Read {formatDate(notification.readAt)}
                </span>
              )}
            </div>
          </div>

          {/* Unread indicator for mobile */}
          {notification.status !== 'read' && (
            <div className="sm:hidden flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Notifications</h2>
          <p className="text-neutral-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
      </div>

      {/* Filters - Fixed to prevent horizontal scroll */}
      <div className="bg-white rounded-lg shadow-medium p-4 max-w-full">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Read Status Filter */}
          <div className="flex-1 min-w-0">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Status</label>
            <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1">
              {(['all', 'unread', 'read'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all capitalize ${
                    filter === status
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'unread' ? 'Unread' : 'Read'}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex-1 min-w-0">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Priority</label>
            <div className="flex flex-wrap gap-1">
              {(['all', ...Object.values(NotificationPriority)] as const).map((priority) => {
                const priorityInfo = priority === 'all' ? null : getPriorityInfo(priority);
                return (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priority)}
                    className={`flex items-center px-3 py-2 rounded text-sm font-medium transition-all ${
                      priorityFilter === priority
                        ? 'bg-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                    } ${
                      priority === 'all'
                        ? priorityFilter === priority
                          ? 'text-primary-600'
                          : ''
                        : priorityInfo?.color.replace('bg-', 'text-').split(' ')[0]
                    }`}
                  >
                    {priority !== 'all' && <span className="mr-1">{priorityInfo?.icon}</span>}
                    {priority === 'all' ? 'All' : priorityInfo?.text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex-1 min-w-0">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Type</label>
            <div className="flex flex-wrap gap-1">
              {(['all', ...Object.values(RelatedNotificationEntity)] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`flex items-center px-3 py-2 rounded text-sm font-medium transition-all capitalize ${
                    typeFilter === type
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {type !== 'all' && <span className="mr-1">{getEntityIcon(type)}</span>}
                  {type === 'all' ? 'All' : type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden max-w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Notifications ({pagination.totalItems})</h3>
            <div className="text-sm text-neutral-500 mt-1 sm:mt-0">
              Showing {startIndex} to {endIndex} of {pagination.totalItems} notifications
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <FiBell className="mx-auto text-4xl text-neutral-300 mb-3" />
            <p>No notifications found</p>
            <p className="text-sm mt-1">You're all caught up!</p>
            {(filter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilter('all');
                  setPriorityFilter('all');
                  setTypeFilter('all');
                }}
                className="mt-3"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-neutral-200 max-w-full">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>

            {/* Pagination - Using OrganizationsPage style */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0">
                <div className="text-sm text-neutral-500">
                  Showing {startIndex} to {endIndex} of {pagination.totalItems} notifications
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === 1 || isLoading}
                    onClick={() => handlePagination(pagination.currentPage - 1)}
                  >
                    <FiChevronLeft className="mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;

                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      // prevent invalid page numbers
                      if (pageNum < 1 || pageNum > pagination.totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          className={`px-3 py-1 rounded text-sm ${
                            pageNum === pagination.currentPage
                              ? 'bg-primary-600 text-white'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => !isLoading && handlePagination(pageNum)}
                          disabled={isLoading}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage || isLoading}
                    onClick={() => handlePagination(pagination.currentPage + 1)}
                  >
                    Next
                    <FiChevronRight className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
