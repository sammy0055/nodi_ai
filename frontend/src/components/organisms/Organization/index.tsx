import React, { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiShoppingBag,
  FiSmartphone,
  FiMessageCircle,
  FiGlobe,
  FiPackage,
  FiTruck,
  FiXCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiShoppingCart,
  FiBox,
  FiUserCheck,
} from 'react-icons/fi';
import Button from '../../atoms/Button/Button';
import type { OrderPageProps, OrderStats } from '../../../pages/tenant/OrderPage';
import { useOrdersSetRecoilState, useOrdersValue, useUserSetRecoilState, useUserValue } from '../../../store/authAtoms';
import useProcessingTime, { getOrderProcessingTime } from '../../../hooks/orderProcessingTimer';
import { OrderService } from '../../../services/orderService';
import { UserService } from '../../../services/userService';
import type { Pagination } from '../../../types/customer';
import { useValidateUserRolesAndPermissions } from '../../../hooks/validateUserRoleAndPermissions';
import { useGetOrdersOnInterval } from '../../../hooks/orders';

// Order status object
export const OrderStatusTypes = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  SCHEDULED: 'scheduled',
} as const;

// Order source object
export const OrderSourceTypes = {
  CHATBOT: 'chatbot',
  WEBSITE: 'website',
  MOBILE_APP: 'mobile_app',
  API: 'api',
  WALK_IN: 'walk_in',
} as const;

// Order priority levels
export const OrderPriorityTypes = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type OrderStatus = (typeof OrderStatusTypes)[keyof typeof OrderStatusTypes];
export type OrderSource = (typeof OrderSourceTypes)[keyof typeof OrderSourceTypes];
export type OrderPriority = (typeof OrderPriorityTypes)[keyof typeof OrderPriorityTypes];

export interface OrderItemOption {
  optionId: string;
  id: string;
  name: string;
  choiceId: string;
  priceAdjustment: number;
  choice: { id: string; label: string; priceAdjustment: string };
}

export interface OrderItem {
  productId: string;
  inventoryId: string;
  quantity: number;
  totalPrice: string;
  product: {
    name: string;
    price: number;
    currency: string;
    options: OrderItemOption[];
  };
}

export interface IOrder {
  id: string;
  orderNumber: string;
  title: string;
  customerId: string;
  organizationId: string;
  branchId: string;
  status: OrderStatus;
  source: OrderSource;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  currency: string;
  deliveryAreaId: string;
  deliveryAreaName?: string;
  deliveryTime?: Date;
  shippingAddress?: string;
  serviceType: 'delivery' | 'takeaway' | 'dine_in';
  createdAt: Date;
  updatedAt: Date;

  // New fields for assignment and timing
  assignedUserId?: string;
  assignedUserName?: string;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletionTime?: number;
  priority: OrderPriority;
  notes?: string;
  customerNotes?: string;

  branch: {
    id: string;
    name: string;
    address?: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    avatar?: string;
  };
  area: {
    id: string;
    name: string;
    zone: {
      id: string;
      name: string;
    };
  };
}

const StaffOrderPage: React.FC<OrderPageProps> = (data) => {
  const orders = useOrdersValue();
  const currentUser = useUserValue();
  const setCurrentUser = useUserSetRecoilState();
  const setOrders = useOrdersSetRecoilState();
  // State
  const [activeTab, setActiveTab] = useState<OrderStatus>('processing');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<Pagination>();
  const [loading, setLoading] = useState(false);

  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [_, setAssignToUserId] = useState<string>('');
  const [orderStats, setOrderStats] = useState<OrderStats>();
  const { isUserPermissionsValid } = useValidateUserRolesAndPermissions(currentUser!);
  const processingTime = useProcessingTime(selectedOrder!);
  const { updateOrder, updateOrderStatus, getOrders, getOrderStatsPerAsignedUser } = new OrderService();

  const getData = async (data: any) => {
    const stats = await getOrderStatsPerAsignedUser(data.currentUser.id);
    setOrderStats(stats.data);
  };
  // Tabs configuration
  const tabs = [
    {
      id: OrderStatusTypes.PENDING,
      label: 'New Orders',
      icon: FiPlus,
      color: 'border-blue-200 bg-blue-50',
      textColor: 'text-blue-700',
      count: 12,
    },
    {
      id: OrderStatusTypes.PROCESSING,
      label: 'Processing',
      icon: FiRefreshCw,
      color: 'border-purple-200 bg-purple-50',
      textColor: 'text-purple-700',
      count: 15,
    },
    {
      id: OrderStatusTypes.SHIPPED,
      label: 'Shipped',
      icon: FiTruck,
      color: 'border-indigo-200 bg-indigo-50',
      textColor: 'text-indigo-700',
      count: 7,
    },
    {
      id: OrderStatusTypes.DELIVERED,
      label: 'Delivered',
      icon: FiPackage,
      color: 'border-green-200 bg-green-50',
      textColor: 'text-green-700',
      count: 24,
    },
    {
      id: OrderStatusTypes.CANCELLED,
      label: 'Cancelled',
      icon: FiXCircle,
      color: 'border-red-200 bg-red-50',
      textColor: 'text-red-700',
      count: 3,
    },
    {
      id: OrderStatusTypes.SCHEDULED,
      label: 'Scheduled',
      icon: FiXCircle,
      color: 'border-red-200 bg-red-50',
      textColor: 'text-red-700',
      count: 3,
    },
  ];

  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      setOrders(data.orders.data);
      setCurrentUser(data.currentUser);
      setSelectedOrder(data.orders.data[0] || null);
      setLoading(false);
      setPagination(data.orders.pagination);
      getData(data)
    }
  }, [data]);

  useGetOrdersOnInterval(data, activeTab, { setPagination });

  useEffect(() => {
    handlePagination(pagination?.currentPage || 1);
  }, [activeTab]);

  // Filter orders based on selected tab and filters
  const fetchOrders = async (page: number, resetData = false) => {
    try {
      setLoading(true);
      const filters: any = { page };

      const selectedTab = tabs.find((t) => t.id === activeTab)!.id;

      if (selectedTab !== 'pending') {
        filters.status = selectedTab;
      }
      if (selectedTab === 'scheduled') {
        return;
      }
      if (selectedTab === 'pending') filters.status = OrderStatusTypes.PENDING;
      const response = await getOrders(filters);

      const newData = response.data.data;
      const pagination = response.data.pagination;

      setOrders((prev) => (resetData ? newData : [...prev, ...newData]));
      setSelectedOrder(response.data.data[0]);
      setPagination(pagination);
      setLoading(false);
    } catch (error: any) {
      alert('something went wrong');
    }
  };

  const handlePagination = async (page: number) => {
    fetchOrders(page, page === 1);
  };

  // Load more data
  const loadMore = () => {
    handlePagination((pagination?.currentPage && pagination?.currentPage + 1) || 1);
  };

  const formatTime = useCallback((seconds: number) => {
    if (!seconds) return 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }, []);

  // Handle order selection
  const handleSelectOrder = (order: IOrder) => {
    setSelectedOrder(order);
    if (window.innerWidth < 768) {
      setMobileView('detail');
    }
  };

  const { updateUser } = new UserService();
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (!isUserPermissionsValid(['order.process'])) {
        alert("you don't have permission to process an order");
        return;
      }

      if (newStatus === 'cancelled') {
        if (!isUserPermissionsValid(['order.cancel'])) {
          alert("you don't have permission to cancel an order");
          return;
        }
      }
      const orderToUpdate = orders.find((o) => o.id === orderId);
      if (orderToUpdate?.status === 'delivered') {
        alert('can not change order status, order is already completed');
        return;
      }
      if (newStatus === 'delivered') {
        if (!orderToUpdate) {
          alert('order not found');
          return;
        }
        const processingTime = getOrderProcessingTime(orderToUpdate);
        const updatedOrder = {
          ...orderToUpdate,
          estimatedCompletionTime: processingTime,
          status: newStatus,
          completedAt: new Date(),
        };

        await updateOrder(updatedOrder);
        setOrders((prevOrders) => prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
        setSelectedOrder(updatedOrder);
      }

      await updateOrderStatus({ orderId, status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
      setSelectedOrder({ ...selectedOrder, status: newStatus } as any);
      alert('order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleAssignOrder = async (order: IOrder, userId: string) => {
    if (!isUserPermissionsValid(['order.asign'])) {
      alert("you don't have permission to asign an order");
      return;
    }
    if (!userId) return;
    if (order.status === 'delivered') {
      alert('this order is already completed');
      return;
    }

    const user = currentUser;
    if (!user) return;

    if (user.activeOrderCount && user.maxConcurrentOrders && user.activeOrderCount >= user.maxConcurrentOrders) {
      alert(`${user.name} has reached maximum concurrent orders (${user.maxConcurrentOrders})`);
      return;
    }

    try {
      const updatedOrder: IOrder = {
        ...order,
        status: order.status === 'pending' ? OrderStatusTypes.PROCESSING : order.status,
        assignedUserId: userId,
        assignedUserName: user.name,
        assignedAt: new Date(),
        startedAt: new Date(),
      };
      const userToUpdate = currentUser;
      if (!userToUpdate) {
        alert('asigned user does not exist');
        return;
      }

      const data = await updateOrder(updatedOrder);
      setOrders((prevOrders) => prevOrders.map((o) => (o.id === data.data.id ? updatedOrder : o)));
      setSelectedOrder(updatedOrder);
      setAssignToUserId(updatedOrder.assignedUserId || '');

      await updateUser({
        ...userToUpdate,
        activeOrderCount: (userToUpdate.activeOrderCount || 0) + 1,
        lastActive: new Date(),
      });

      setCurrentUser(
        (prev) => ({ ...prev, activeOrderCount: (prev?.activeOrderCount || 0) + 1, lastActive: new Date() }) as any
      );
    } catch (error) {
      console.error('Error assigning order:', error);
      alert('Failed to assign order. Please try again.');
    }
  };

  const handleUnassignOrder = async (order: IOrder) => {
    if (!isUserPermissionsValid(['order.unasign'])) {
      alert("you don't have permission to unasign an order");
      return;
    }
    if (!order.assignedUserId) return;
    if (order.status === 'delivered') {
      alert('this order is already completed');
      return;
    }
    try {
      const updatedOrder: any = {
        ...order,
        assignedUserId: null,
        assignedUserName: null,
        assignedAt: null,
        processingTime: null,
        estimatedCompletionTime: null,
      };

      const userToUpdate = currentUser;
      if (!userToUpdate) {
        alert('asigned user does not exist');
        return;
      }

      const data = await updateOrder(updatedOrder);
      setOrders((prevOrders) => prevOrders.map((o) => (o.id === data.data.id ? updatedOrder : o)));
      setSelectedOrder(updatedOrder);
      setAssignToUserId('');
      await updateUser({
        ...userToUpdate,
        activeOrderCount: (userToUpdate.activeOrderCount || 1) - 1,
        lastActive: new Date(),
      });

      setCurrentUser((u) => ({ ...u, activeOrderCount: Math.max(0, (u?.activeOrderCount || 1) - 1) }) as any);
    } catch (error) {
      console.error('Error unassigning order:', error);
      alert('Failed to unassign order. Please try again.');
    }
  };

  const handleAssignToSelf = async (order: IOrder) => {
    if (!currentUser?.id) {
      alert('kindly login');
      return;
    }
    try {
      await handleAssignOrder(order, currentUser?.id);
    } catch (error: any) {
      console.error('Error unassigning order:', error);
      alert('Failed to assignself order. Please try again.');
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: OrderPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get source icon
  const getSourceIcon = (source: OrderSource) => {
    switch (source) {
      case 'website':
        return <FiGlobe className="text-blue-500" size={14} />;
      case 'mobile_app':
        return <FiSmartphone className="text-green-500" size={14} />;
      case 'chatbot':
        return <FiMessageCircle className="text-purple-500" size={14} />;
      case 'api':
        return <FiBox className="text-orange-500" size={14} />;
      case 'walk_in':
        return <FiUser className="text-teal-500" size={14} />;
      default:
        return <FiShoppingCart className="text-gray-500" size={14} />;
    }
  };

  // Mobile back button
  const MobileBackButton = () => (
    <button
      onClick={() => setMobileView('list')}
      className="lg:hidden flex items-center px-4 py-3 mb-4 text-gray-700 hover:text-gray-900 bg-white rounded-lg border border-gray-200"
    >
      <FiArrowLeft className="mr-2" />
      Back to Orders
    </button>
  );

  useEffect(() => {
    if (!currentUser) return; // wait till user is loaded

    if (!isUserPermissionsValid(['order.view'])) {
      window.history.back(); // or navigate('/app')
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto">
        {/* Tabs as Cards - Full Width */}
        <div className="w-full flex items-center bg-white px-4 py-2 shadow-md">
          {/* Back button */}
          <button onClick={() => window.history.back()} className="p-2 rounded hover:bg-gray-100 flex items-center">
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Tabs */}
          <div className="flex space-x-2 ml-4 overflow-x-auto w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as OrderStatus)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? `${tab.color} border-2 ${tab.textColor} shadow`
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <Icon className={isActive ? tab.textColor : 'text-gray-500'} size={20} />
                  <span className={`text-sm font-medium ${isActive ? tab.textColor : 'text-gray-700'}`}>
                    {tab.label} {orderStats?.statusCounts.find(stats => stats.status === tab.id)?.count || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout - Only Order List has Scrollbar */}
        <div className="flex flex-col lg:flex-row border border-gray-200 rounded-xl bg-white">
          {/* Left Column - Orders List with Scrollbar */}
          {(mobileView === 'list' || window.innerWidth >= 768) && (
            <div className="lg:w-2/5 flex flex-col border-r border-gray-200">
              <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Orders ({pagination?.totalItems})</h3>
                    <p className="text-sm text-gray-500 mt-1">Select an order to view details</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {pagination?.totalPages} of {pagination?.totalItems}
                  </div>
                </div>
              </div>

              {/* Scrollable Orders List */}
              <div className="h-[600px] overflow-y-auto">
                {loading && pagination?.currentPage === 1 ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading orders...</p>
                  </div>
                ) : orders?.length === 0 ? (
                  <div className="p-8 text-center">
                    <FiBox className="mx-auto text-gray-400" size={48} />
                    <p className="mt-2 text-gray-600">No orders found</p>
                    {(searchTerm || selectedPriority !== 'all' || selectedSource !== 'all') && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedPriority('all');
                          setSelectedSource('all');
                        }}
                        className="mt-4"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                ) : (
                  orders
                    ?.filter((order) => order.status === activeTab)
                    ?.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => handleSelectOrder(order)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                          selectedOrder?.id === order.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            {/* <h3 className="font-semibold text-gray-900">{order.id}</h3> */}
                            <p className="text-sm text-gray-600 mt-1">{order.customer.name}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(order.totalAmount, order.currency)}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <FiCalendar className="mr-1" size={12} />
                          <span>{formatDate(order.createdAt)}</span>
                          <span className="mx-2">•</span>
                          <FiMapPin className="mr-1" size={12} />
                          <span>{order.branch.name}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                                order.priority
                              )}`}
                            >
                              {order.priority}
                            </span>
                            <div className="flex items-center text-gray-500">
                              {getSourceIcon(order.source)}
                              <span className="ml-1 text-xs">{order.source.replace('_', ' ')}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Load More Button */}
              {pagination?.hasNextPage && pagination.totalPages > 0 && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  <Button onClick={loadMore} variant="outline" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More Orders'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Right Column - Order Details (No Scrollbar) */}
          {(mobileView === 'detail' || window.innerWidth >= 768) && selectedOrder?.status === activeTab && (
            <div className="lg:w-3/5 h-[600px] flex flex-col">
              {/* Mobile back button */}
              {window.innerWidth < 768 && <MobileBackButton />}

              <div className="bg-white p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                          selectedOrder.priority
                        )}`}
                      >
                        {selectedOrder.priority}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiUser className="mr-2" size={14} />
                      <span className="font-medium">{selectedOrder.customer.name}</span>
                      <span className="mx-2">•</span>
                      <span>{selectedOrder.customer.phone}</span>
                    </div>
                  </div>

                  {selectedOrder.assignedUserName && (
                    <div className="mt-3 flex items-center">
                      <div className="flex items-center px-3 py-1.5 bg-blue-50 rounded-lg">
                        <FiUserCheck className="text-blue-600 mr-2" size={14} />
                        <span className="text-sm font-medium text-blue-800">{selectedOrder.assignedUserName}</span>
                        {processingTime && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {formatTime(processingTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-2 mt-4 lg:mt-0">
                    {!selectedOrder.assignedUserId ? (
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignToSelf(selectedOrder)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <FiUserCheck className="mr-1" />
                          Asign Self
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnassignOrder(selectedOrder)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <FiUserCheck className="mr-1" />
                        Unassign
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Details Content - No Scrollbar */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {/* Status Update Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Update Order Status</label>
                    <span className="text-xs text-gray-500">Current: {selectedOrder.status}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                      disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                    >
                      Mark As Delivered
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                      disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                    >
                      Cancel Order
                    </Button>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Customer Information - WITHOUT AVATAR AND EMAIL */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiUser className="mr-2" />
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500">Name</div>
                          <div className="font-medium">{selectedOrder?.customer?.name}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Phone</div>
                          <div className="font-medium">{selectedOrder?.customer?.phone}</div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-500">Customer ID</div>
                        <div className="font-medium">{selectedOrder?.customerId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiShoppingBag className="mr-2" />
                      Order Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-gray-500">Created</div>
                          <div className="font-medium">{formatDate(selectedOrder.createdAt)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Service Type</div>
                          <div className="font-medium">{selectedOrder?.serviceType}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-gray-500">Source</div>
                          <div className="font-medium flex items-center">
                            {getSourceIcon(selectedOrder.source)}
                            <span className="ml-2">{selectedOrder.source.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Est. Time</div>
                          <div className="font-medium">{formatTime(selectedOrder.estimatedCompletionTime!)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Branch Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiMapPin className="mr-2" />
                      Branch & Location
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-gray-500">Branch</div>
                        <div className="font-medium">{selectedOrder?.branch?.name}</div>
                        {selectedOrder?.branch?.address && (
                          <div className="text-gray-600 text-xs mt-1">{selectedOrder.branch.address}</div>
                        )}
                      </div>
                      {selectedOrder?.area && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-gray-500">Zone</div>
                            <div className="font-medium">{selectedOrder?.area?.zone?.name}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Area</div>
                            <div className="font-medium">{selectedOrder?.area?.name}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiTruck className="mr-2" />
                      Delivery Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-gray-500">Delivery Charge</div>
                          <div className="font-medium">
                            {formatCurrency(selectedOrder.deliveryCharge, selectedOrder.currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Type</div>
                          <div className="font-medium">
                            {selectedOrder.serviceType.charAt(0).toUpperCase() + selectedOrder.serviceType.slice(1)}
                          </div>
                        </div>
                      </div>
                      {selectedOrder.shippingAddress && (
                        <div>
                          <div className="text-gray-500">Shipping Address</div>
                          <div className="font-medium">{selectedOrder.shippingAddress}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                    <FiPackage className="mr-2" />
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                    <div className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">{item.product.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                Unit Price: {formatCurrency(item.product.price, selectedOrder.currency)}
                              </div>
                              {item?.product?.options?.length > 0 && (
                                <div className="text-sm text-gray-500 mt-2">
                                  Options: {item.product.options.map((opt) => opt.choice.label).join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="font-medium text-gray-900">{item.totalPrice}</div>
                                  <div className="text-sm text-gray-600">
                                    Qty: <span className="font-medium">{item.quantity}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Charge:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedOrder.deliveryCharge, selectedOrder.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {(selectedOrder.notes || selectedOrder.customerNotes) && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Notes</h3>
                    <div className="space-y-4">
                      {selectedOrder.customerNotes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-800 mb-2">Customer Note</h4>
                          <p className="text-yellow-700">{selectedOrder.customerNotes}</p>
                        </div>
                      )}
                      {selectedOrder.notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-800 mb-2">Internal Note</h4>
                          <p className="text-blue-700">{selectedOrder.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile empty state */}
          {mobileView === 'list' && window.innerWidth < 768 && !selectedOrder && (
            <div className="lg:hidden p-8 text-center bg-white border border-gray-200 rounded-xl">
              <FiBox className="mx-auto text-gray-400" size={48} />
              <p className="mt-2 text-gray-600">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// const StaffOrderPage:React.FC<OrderPageProps> = () => {
//   return (
//     <div>
//       <h1>hello</h1>
//     </div>
//   );
// };

export { StaffOrderPage };
