import React, { useEffect, useState, useCallback, useMemo, memo, type ReactElement } from 'react';
import {
  FiSearch,
  FiFilter,
  FiEdit,
  FiEye,
  FiBox,
  FiShoppingCart,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiPackage,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiShoppingBag,
  FiSmartphone,
  FiMessageCircle,
  FiGlobe,
  FiClock,
  FiUsers,
  FiUserCheck,
  FiUserPlus,
  FiAlertCircle,
  FiTrendingUp,
  FiBarChart2,
  FiActivity,
  FiZap,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useDebounce } from 'use-debounce';
import { useOrdersSetRecoilState, useOrdersValue, useUserSetRecoilState, useUserValue } from '../../store/authAtoms';
import { OrderService } from '../../services/orderService';
import { useLoaderData } from 'react-router';
import type { Pagination } from '../../types/customer';
import type { User } from '../../types/users';
import { UserService } from '../../services/userService';
import useProcessingTime from '../../hooks/orderProcessingTimer';

// Extended User interface with additional fields for order management

// Order status object
export const OrderStatusTypes = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
  ON_HOLD: 'on_hold',
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

// Status Select Component - Memoized to prevent unnecessary re-renders
const StatusSelect = memo(
  ({
    order,
    updatingOrderId,
    onStatusUpdate,
  }: {
    order: IOrder;
    updatingOrderId: string | null;
    onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onStatusUpdate(order.id, e.target.value as OrderStatus);
      },
      [order.id, onStatusUpdate]
    );

    return (
      <div className="relative">
        <select
          value={order.status}
          onChange={handleChange}
          disabled={updatingOrderId === order.id}
          className={`appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            updatingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
          }`}
        >
          {Object.values(OrderStatusTypes).map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          {updatingOrderId === order.id ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          ) : (
            <FiEdit size={12} />
          )}
        </div>
      </div>
    );
  }
);

StatusSelect.displayName = 'StatusSelect';

// Memoized OrderRow component
const OrderRow = memo(
  ({
    order,
    updatingOrderId,
    onStatusUpdate,
    onViewOrder,
    onAssignToSelf,
    onOpenAssignmentModal,
    onUnassignOrder,
    getStatusColor,
    getStatusIcon,
    getPriorityColor,
    getSourceIcon,
    formatDate,
    formatTime,
    formatCurrency,
  }: {
    order: IOrder;
    updatingOrderId: string | null;
    onStatusUpdate: (orderId: string, status: OrderStatus) => void;
    onViewOrder: (order: IOrder) => void;
    onAssignToSelf: (order: IOrder) => void;
    onOpenAssignmentModal: (order: IOrder) => void;
    onUnassignOrder: (order: IOrder) => void;
    getStatusColor: (status: OrderStatus) => string;
    getStatusIcon: (status: OrderStatus) => ReactElement;
    getPriorityColor: (priority: OrderPriority) => string;
    getSourceIcon: (source: OrderSource) => ReactElement;
    formatDate: (date: Date) => string;
    formatTime: (seconds: number) => string;
    formatCurrency: (amount: number, currency?: string) => string;
  }) => {
    const processingTime = useProcessingTime(order);
    return (
      <div className="group bg-white hover:bg-gray-50 rounded-lg border border-gray-200 p-4 mb-3 transition-all duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          {/* Left Section */}
          <div className="flex-1">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  {getSourceIcon(order.source)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{order.orderNumber}</h3>
                  <div className="flex items-center space-x-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        order.priority
                      )}`}
                    >
                      <FiZap className="mr-1" size={10} />
                      {order.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <FiUser className="mr-2 text-gray-400" size={14} />
                    <span className="truncate">{order.customer.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="mr-2 text-gray-400" size={14} />
                    <span className="truncate">{order.branch.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="mr-2 text-gray-400" size={14} />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiShoppingCart className="mr-2 text-gray-400" size={14} />
                    <span>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {order.assignedUserName && (
                  <div className="mt-3 flex items-center">
                    <div className="flex items-center px-3 py-1.5 bg-blue-50 rounded-lg">
                      <FiUserCheck className="text-blue-600 mr-2" size={14} />
                      <span className="text-sm font-medium text-blue-800">{order.assignedUserName}</span>
                      {processingTime && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {formatTime(processingTime)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
            <div className="text-right mb-3">
              <p className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount, order.currency)}</p>
              {order.estimatedCompletionTime && (
                <p className="text-xs text-gray-500 mt-1">Est: {order.estimatedCompletionTime} min</p>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewOrder(order)}
                className="border-gray-300 hover:border-gray-400"
              >
                <FiEye className="mr-1" />
                View
              </Button>

              {!order.assignedUserId ? (
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignToSelf(order)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <FiUserCheck className="mr-1" />
                    Self
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenAssignmentModal(order)}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <FiUsers className="mr-1" />
                    Assign
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUnassignOrder(order)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <FiUserCheck className="mr-1" />
                  Unassign
                </Button>
              )}

              <StatusSelect order={order} updatingOrderId={updatingOrderId} onStatusUpdate={onStatusUpdate} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OrderRow.displayName = 'OrderRow';

// Memoized OrderCard component
const OrderCard = memo(
  ({
    order,
    // updatingOrderId,
    // onStatusUpdate,
    onViewOrder,
    onAssignToSelf,
    onUnassignOrder,
    getStatusColor,
    getStatusIcon,
    getPriorityColor,
    getSourceIcon,
    formatDate,
    formatTime,
    formatCurrency,
  }: {
    order: IOrder;
    updatingOrderId: string | null;
    onStatusUpdate: (orderId: string, status: OrderStatus) => void;
    onViewOrder: (order: IOrder) => void;
    onAssignToSelf: (order: IOrder) => void;
    onUnassignOrder: (order: IOrder) => void;
    getStatusColor: (status: OrderStatus) => string;
    getStatusIcon: (status: OrderStatus) => ReactElement;
    getPriorityColor: (priority: OrderPriority) => string;
    getSourceIcon: (source: OrderSource) => ReactElement;
    formatDate: (date: Date) => string;
    formatTime: (seconds: number) => string;
    formatCurrency: (amount: number, currency?: string) => string;
  }) => {
    const processingTime = useProcessingTime(order);
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 group">
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                {getSourceIcon(order.source)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                order.priority
              )}`}
            >
              <FiZap size={10} className="mr-1" />
              {order.priority}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <FiUser size={12} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
              <p className="text-xs text-gray-500">{order.customer.phone}</p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiMapPin className="mr-1" size={12} />
            <span className="truncate">{order.branch.name}</span>
          </div>
        </div>

        {/* Assigned User */}
        {order.assignedUserName && (
          <div className="mb-4 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <FiUserCheck className="text-blue-600 mr-2" size={14} />
              <span className="text-sm font-medium text-blue-800">{order.assignedUserName}</span>
              {processingTime && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {formatTime(processingTime)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Items</p>
            <p className="font-medium">{order.items.length}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Est. Time</p>
            <p className="font-medium">{order.estimatedCompletionTime || 'N/A'} min</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount, order.currency)}</p>
          </div>
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" onClick={() => onViewOrder(order)} className="!p-1.5">
              <FiEye size={14} />
            </Button>
            {!order.assignedUserId ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAssignToSelf(order)}
                className="!p-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <FiUserCheck size={14} />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnassignOrder(order)}
                className="!p-1.5 text-red-600 border-red-200 hover:bg-red-50"
              >
                <FiUserCheck size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

OrderCard.displayName = 'OrderCard';

const OrdersPage: React.FC = () => {
  const data = useLoaderData() as {
    orders: { data: IOrder[]; pagination: Pagination };
    users: User[];
    currentUser: User;
  };
  const orders = useOrdersValue();
  const currentUser = useUserValue();
  const setCurrentUser = useUserSetRecoilState();
  const setOrders = useOrdersSetRecoilState();
  const [_, setPagination] = useState<Pagination>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<OrderPriority | 'all'>('all');
  const [selectedTab, setSelectedTab] = useState<
    'all' | 'assigned' | 'processing' | 'delivered' | 'cancelled' | 'refunded' | 'pending'
  >('all');

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<IOrder | null>(null);
  const [assignToUserId, setAssignToUserId] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const selectedOrderProcessingTime = useProcessingTime(selectedOrder!);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const { updateOrderStatus } = useMemo(() => new OrderService(), []);
  const { updateUser } = useMemo(() => new UserService(), []);

  // Mock users data with enhanced fields
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (data) {
      setOrders(data.orders.data);
      setPagination(data.orders.pagination);
      setUsers(data.users);
      setCurrentUser(data.currentUser);
    }
  }, [data]);

  useEffect(() => {
    const Fn = async () => {
      const data = await getOrders({ page: 1, searchTerm });
      setOrders(data.data.data);
      setPagination(data?.data?.pagination);
    };
    if (debouncedSearchTerm) Fn();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    handlePagination(1);
  }, [selectedStatus, selectedTab, selectedPriority]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      if (newStatus === 'delivered' || newStatus === 'completed') {
        const orderToUpdate = orders.find((o) => o.id === orderId);
        if (!orderToUpdate) {
          alert('order not found');
          return;
        }
        await updateOrder({ ...orderToUpdate, status: newStatus, completedAt: new Date() });
      }
      await updateOrderStatus({ orderId, status: newStatus });

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            const updatedOrder = { ...order, status: newStatus };

            if (
              newStatus === OrderStatusTypes.DELIVERED ||
              newStatus === OrderStatusTypes.CANCELLED ||
              newStatus === OrderStatusTypes.REFUNDED
            ) {
              const assignedUserId = order.assignedUserId;
              if (assignedUserId) {
                setUsers((prevUsers) =>
                  prevUsers.map((u) =>
                    u.id === assignedUserId ? { ...u, activeOrderCount: Math.max(0, (u.activeOrderCount || 1) - 1) } : u
                  )
                );
              }

              return {
                ...updatedOrder,
                processingTime: undefined,
                assignedUserId: undefined,
                assignedUserName: undefined,
              };
            }

            return updatedOrder;
          }
          return order;
        })
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleAssignOrder = useCallback(
    async (order: IOrder, userId: string) => {
      if (!userId) return;

      const user = users.find((u) => u.id === userId);
      if (!user) return;

      if (user.activeOrderCount && user.maxConcurrentOrders && user.activeOrderCount >= user.maxConcurrentOrders) {
        alert(`${user.name} has reached maximum concurrent orders (${user.maxConcurrentOrders})`);
        return;
      }

      try {
        const updatedOrder: IOrder = {
          ...order,
          status: OrderStatusTypes.PROCESSING,
          assignedUserId: userId,
          assignedUserName: user.name,
          assignedAt: new Date(),
          startedAt: new Date(),
        };
        const userToUpdate = users.find((u) => u.id === userId);
        if (!userToUpdate) {
          alert('asigned user does not exist');
          setShowAssignmentModal(false);
          setOrderToAssign(null);
          setAssignToUserId('');
          return;
        }

        const data = await updateOrder(updatedOrder);
        setOrders((prevOrders) => prevOrders.map((o) => (o.id === data.data.id ? updatedOrder : o)));

        await updateUser({
          ...userToUpdate,
          activeOrderCount: (userToUpdate.activeOrderCount || 0) + 1,
          lastActive: new Date(),
        });

        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === userId ? { ...u, activeOrderCount: (u.activeOrderCount || 0) + 1, lastActive: new Date() } : u
          )
        );

        setShowAssignmentModal(false);
        setOrderToAssign(null);
        setAssignToUserId('');
      } catch (error) {
        console.error('Error assigning order:', error);
        alert('Failed to assign order. Please try again.');
      }
    },
    [users, setOrders, setUsers]
  );

  const handleUnassignOrder = useCallback(
    async (order: IOrder) => {
      if (!order.assignedUserId) return;

      try {
        const updatedOrder: any = {
          ...order,
          status: OrderStatusTypes.CONFIRMED,
          assignedUserId: null,
          assignedUserName: null,
          assignedAt: null,
          processingTime: null,
        };

        const userToUpdate = users.find((u) => u.id === order.assignedUserId);
        if (!userToUpdate) {
          alert('asigned user does not exist');
          setShowAssignmentModal(false);
          setOrderToAssign(null);
          setAssignToUserId('');
          return;
        }

        const data = await updateOrder(updatedOrder);
        setOrders((prevOrders) => prevOrders.map((o) => (o.id === data.data.id ? updatedOrder : o)));

        await updateUser({
          ...userToUpdate,
          activeOrderCount: (userToUpdate.activeOrderCount || 1) - 1,
          lastActive: new Date(),
        });

        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === order.assignedUserId ? { ...u, activeOrderCount: Math.max(0, (u.activeOrderCount || 1) - 1) } : u
          )
        );
      } catch (error) {
        console.error('Error unassigning order:', error);
        alert('Failed to unassign order. Please try again.');
      }
    },
    [setOrders, setUsers, users]
  );

  const handleAssignToSelf = useCallback(
    async (order: IOrder) => {
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
    },
    [currentUser?.id, handleAssignOrder]
  );

  const handleViewOrder = useCallback((order: IOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }, []);

  const handleOpenAssignmentModal = useCallback((order: IOrder) => {
    setOrderToAssign(order);
    setShowAssignmentModal(true);
  }, []);

  const getStatusColor = useCallback((status: OrderStatus) => {
    switch (status) {
      case OrderStatusTypes.PENDING:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case OrderStatusTypes.CONFIRMED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case OrderStatusTypes.PROCESSING:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case OrderStatusTypes.SHIPPED:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case OrderStatusTypes.DELIVERED:
        return 'bg-green-50 text-green-700 border-green-200';
      case OrderStatusTypes.CANCELLED:
        return 'bg-red-50 text-red-700 border-red-200';
      case OrderStatusTypes.RETURNED:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case OrderStatusTypes.REFUNDED:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case OrderStatusTypes.ON_HOLD:
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }, []);

  const getStatusIcon = useCallback((status: OrderStatus) => {
    switch (status) {
      case OrderStatusTypes.PENDING:
        return <FiClock className="text-yellow-600" />;
      case OrderStatusTypes.CONFIRMED:
        return <FiCheckCircle className="text-blue-600" />;
      case OrderStatusTypes.PROCESSING:
        return <FiRefreshCw className="text-purple-600" />;
      case OrderStatusTypes.SHIPPED:
        return <FiTruck className="text-indigo-600" />;
      case OrderStatusTypes.DELIVERED:
        return <FiPackage className="text-green-600" />;
      case OrderStatusTypes.CANCELLED:
        return <FiXCircle className="text-red-600" />;
      case OrderStatusTypes.RETURNED:
        return <FiRefreshCw className="text-orange-600" />;
      case OrderStatusTypes.REFUNDED:
        return <FiDollarSign className="text-gray-600" />;
      case OrderStatusTypes.ON_HOLD:
        return <FiAlertCircle className="text-pink-600" />;
      default:
        return <FiBox className="text-gray-600" />;
    }
  }, []);

  const getSourceIcon = useCallback((source: OrderSource) => {
    switch (source) {
      case OrderSourceTypes.WEBSITE:
        return <FiGlobe className="text-blue-500" />;
      case OrderSourceTypes.MOBILE_APP:
        return <FiSmartphone className="text-green-500" />;
      case OrderSourceTypes.CHATBOT:
        return <FiMessageCircle className="text-purple-500" />;
      case OrderSourceTypes.API:
        return <FiShoppingBag className="text-orange-500" />;
      case OrderSourceTypes.WALK_IN:
        return <FiUser className="text-teal-500" />;
      default:
        return <FiShoppingCart className="text-gray-500" />;
    }
  }, []);

  const getPriorityColor = useCallback((priority: OrderPriority) => {
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
  }, []);

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }, []);

  const formatTime = useCallback((seconds: number) => {
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

  const formatCurrency = useCallback((amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const { getOrders, getAssignedOrders, updateOrder } = useMemo(() => new OrderService(), []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    const allOrders = orders;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= today);
    const processingOrders = allOrders.filter((o) => o.status === OrderStatusTypes.PROCESSING);
    const pendingOrders = allOrders.filter((o) => o.status === OrderStatusTypes.PENDING);
    const highPriorityOrders = allOrders.filter((o) => o.priority === 'urgent' || o.priority === 'high');

    const totalRevenue = allOrders
      .filter((o) => o.status === OrderStatusTypes.DELIVERED)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const todayRevenue = todayOrders
      .filter((o) => o.status === OrderStatusTypes.DELIVERED)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // const avgProcessingTime =
    //   processingOrders.length > 0
    //     ? processingOrders.reduce((sum, o) => sum + (o.processingTime || 0), 0) / processingOrders.length
    //     : 0;

    return {
      totalOrders: allOrders.length,
      todayOrders: todayOrders.length,
      processingOrders: processingOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue,
      todayRevenue,
      avgProcessingTime: 0,
      highPriorityOrders: highPriorityOrders.length,
    };
  }, [orders]);
  console.log('==================selectedTab==================');
  console.log(selectedTab);
  console.log('====================================');
  // Filter orders based on selected tab and filters
  const fetchOrders = async (page: number, resetData = false) => {
    const filters: any = { page };

    if (selectedTab !== 'all' && selectedTab !== 'assigned') {
      filters.status = selectedTab;
    }

    const response = selectedTab === 'assigned' ? await getAssignedOrders(filters) : await getOrders(filters);

    const newData = response.data.data;
    const pagination = response.data.pagination;

    setOrders((prev) => (resetData ? newData : [...prev, ...newData]));
    setPagination(pagination);
  };

  const handlePagination = async (page: number) => {
    fetchOrders(page, page === 1);
  };

  // const filteredOrders = useMemo(
  //   () =>
  //     orders.filter((order) => {
  //       // Tab filter
  //       let tabFilter = true;
  //       switch (selectedTab) {
  //         case 'all':
  //           tabFilter = true;
  //           break;
  //         case 'assigned':
  //           tabFilter = !!order.assignedUserId;
  //           break;
  //         case 'processing':
  //           tabFilter = order.status === OrderStatusTypes.PROCESSING;
  //           break;
  //         case 'completed':
  //           tabFilter = order.status === OrderStatusTypes.DELIVERED;
  //           break;
  //         case 'cancelled':
  //           tabFilter = order.status === OrderStatusTypes.CANCELLED;
  //           break;
  //         case 'refunded':
  //           tabFilter = order.status === OrderStatusTypes.REFUNDED;
  //           break;
  //         case 'pending':
  //           tabFilter = order.status === OrderStatusTypes.PENDING;
  //           break;
  //       }

  //       // Status filter
  //       const statusFilter = selectedStatus === 'all' || order.status === selectedStatus;

  //       // Priority filter
  //       const priorityFilter = selectedPriority === 'all' || order.priority === selectedPriority;

  //       // Search filter
  //       const searchFilter =
  //         !searchTerm ||
  //         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         order.customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         order.branch.name.toLowerCase().includes(searchTerm.toLowerCase());

  //       return tabFilter && statusFilter && priorityFilter && searchFilter;
  //     }),
  //   [orders, selectedTab, selectedStatus, selectedPriority, searchTerm]
  // );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Track and process customer orders in real-time</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <FiShoppingBag className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <FiTrendingUp className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{stats.todayOrders} today</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.processingOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                <FiRefreshCw className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg. Time</span>
                <span className="font-medium text-gray-900">{formatTime(stats.avgProcessingTime)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <FiDollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <span className="text-gray-600">Today: </span>
              <span className="font-medium text-green-600 ml-2">{formatCurrency(stats.todayRevenue)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.highPriorityOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <FiAlertCircle className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <FiClock className="text-gray-400 mr-1" />
              <span className="text-gray-600">{stats.pendingOrders} pending</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center border-b-2 transition-all ${
                  selectedTab === 'all'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiBox className="mr-2" />
                All Orders
                <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">{orders.length}</span>
              </button>

              <button
                onClick={() => setSelectedTab('pending')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center border-b-2 transition-all ${
                  selectedTab === 'pending'
                    ? 'border-yellow-600 text-yellow-600 bg-yellow-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiClock className="mr-2" />
                Pending
                <span className="ml-2 bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-xs">
                  {orders.filter((o) => o.status === OrderStatusTypes.PENDING).length}
                </span>
              </button>

              <button
                onClick={() => setSelectedTab('assigned')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center border-b-2 transition-all ${
                  selectedTab === 'assigned'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiUserCheck className="mr-2" />
                Assigned
                <span className="ml-2 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                  {orders.filter((o) => o.assignedUserId).length}
                </span>
              </button>

              <button
                onClick={() => setSelectedTab('processing')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center border-b-2 transition-all ${
                  selectedTab === 'processing'
                    ? 'border-purple-600 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiRefreshCw className="mr-2" />
                Processing
                <span className="ml-2 bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs">
                  {orders.filter((o) => o.status === OrderStatusTypes.PROCESSING).length}
                </span>
              </button>

              <button
                onClick={() => setSelectedTab('delivered')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center border-b-2 transition-all ${
                  selectedTab === 'delivered'
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiCheckCircle className="mr-2" />
                Delivered
                <span className="ml-2 bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                  {orders.filter((o) => o.status === OrderStatusTypes.DELIVERED).length}
                </span>
              </button>

              <button
                onClick={() => setSelectedTab('cancelled')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center border-b-2 transition-all ${
                  selectedTab === 'cancelled'
                    ? 'border-red-600 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiXCircle className="mr-2" />
                Cancelled
                <span className="ml-2 bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs">
                  {orders.filter((o) => o.status === OrderStatusTypes.CANCELLED).length}
                </span>
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search orders, customers, or phone..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                  >
                    <FiBarChart2 size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                  >
                    <FiGrid size={16} />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-gray-100' : ''}
                >
                  <FiFilter className="mr-2" />
                  Filters
                  {(selectedStatus !== 'all' || selectedPriority !== 'all') && (
                    <span className="ml-2 bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {(selectedStatus !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'all')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      {Object.values(OrderStatusTypes).map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as OrderPriority | 'all')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Priorities</option>
                      {Object.values(OrderPriorityTypes).map((priority) => (
                        <option key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Newest First</option>
                      <option>Oldest First</option>
                      <option>Highest Amount</option>
                      <option>Lowest Amount</option>
                      <option>Highest Priority</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Users Status Bar */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiUsers className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Active Team:</span>
              </div>
              <div className="flex space-x-4 overflow-x-auto">
                {users
                  .filter((user) => user.isActive)
                  .map((user) => (
                    <div key={user.id} className="flex items-center space-x-2 text-sm">
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            user.activeOrderCount ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                          }`}
                        />
                        <span className="font-medium text-gray-900">{user.name.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center bg-gray-100 rounded-full px-2 py-0.5">
                        <FiBox className="text-gray-500 mr-1" size={10} />
                        <span className="text-xs font-medium">
                          {user.activeOrderCount || 0}/{user.maxConcurrentOrders || 5}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Orders Content */}
          <div className="p-4">
            {orders?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm
                    ? `No orders match "${searchTerm}". Try a different search term or clear filters.`
                    : `No orders in the "${selectedTab}" category. Try selecting a different tab.`}
                </p>
                {(searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('all');
                      setSelectedPriority('all');
                    }}
                    className="mt-4"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-3">
                {orders?.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    updatingOrderId={updatingOrderId}
                    onStatusUpdate={handleStatusUpdate}
                    onViewOrder={handleViewOrder}
                    onAssignToSelf={handleAssignToSelf}
                    onOpenAssignmentModal={handleOpenAssignmentModal}
                    onUnassignOrder={handleUnassignOrder}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getPriorityColor={getPriorityColor}
                    getSourceIcon={getSourceIcon}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders?.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    updatingOrderId={updatingOrderId}
                    onStatusUpdate={handleStatusUpdate}
                    onViewOrder={handleViewOrder}
                    onAssignToSelf={handleAssignToSelf}
                    onUnassignOrder={handleUnassignOrder}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getPriorityColor={getPriorityColor}
                    getSourceIcon={getSourceIcon}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Assignment Modal */}
        {showAssignmentModal && orderToAssign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Assign Order</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Order {orderToAssign.orderNumber} - {orderToAssign.customer.name}
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Team Member</label>
                    <select
                      value={assignToUserId}
                      onChange={(e) => setAssignToUserId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a team member...</option>
                      {users
                        .filter((user) => user.isActive && user?.roles?.length !== 0)
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.roles[0].name}) - {user.activeOrderCount || 0}/
                            {user.maxConcurrentOrders || 5} orders
                          </option>
                        ))}
                    </select>
                  </div>

                  {assignToUserId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <FiAlertCircle className="text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">Assignment Note</span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        The timer will start immediately upon assignment. Order status will change to "Processing".
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setOrderToAssign(null);
                      setAssignToUserId('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleAssignOrder(orderToAssign, assignToUserId)}
                    disabled={!assignToUserId}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <FiUserPlus className="mr-2" />
                    Assign Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order {selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedOrder.customer.name} • {selectedOrder.customer.phone}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <FiXCircle size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FiUser className="mr-2" />
                        Customer Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span className="font-medium">{selectedOrder.customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone:</span>
                          <span className="font-medium">{selectedOrder.customer.phone}</span>
                        </div>
                        {selectedOrder.customer.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Email:</span>
                            <span className="font-medium">{selectedOrder.customer.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        {selectedOrder.serviceType === 'delivery' ? (
                          <FiTruck className="mr-2" />
                        ) : (
                          <FiPackage className="mr-2" />
                        )}
                        {selectedOrder.serviceType === 'delivery' ? 'Delivery Information' : 'Pickup Information'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Branch:</span>
                          <span className="font-medium">{selectedOrder.branch.name}</span>
                        </div>
                        {selectedOrder.area && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Zone:</span>
                              <span className="font-medium">{selectedOrder.area.zone.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Area:</span>
                              <span className="font-medium">{selectedOrder.area.name}</span>
                            </div>
                          </>
                        )}
                        {selectedOrder.serviceType === 'delivery' && selectedOrder.shippingAddress && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Address:</span>
                            <span className="font-medium">{selectedOrder.shippingAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FiActivity className="mr-2" />
                        Order Status
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Status:</span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              selectedOrder.status
                            )}`}
                          >
                            {getStatusIcon(selectedOrder.status)}
                            <span className="ml-1 capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Priority:</span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                              selectedOrder.priority
                            )}`}
                          >
                            {selectedOrder.priority}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Source:</span>
                          <span className="font-medium flex items-center">
                            {getSourceIcon(selectedOrder.source)}
                            <span className="ml-1 capitalize">{selectedOrder.source.replace('_', ' ')}</span>
                          </span>
                        </div>
                        {selectedOrder.assignedUserName && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Assigned to:</span>
                            <span className="font-medium flex items-center">
                              <FiUserCheck className="mr-1" />
                              {selectedOrder.assignedUserName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FiCalendar className="mr-2" />
                        Timeline
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Created:</span>
                          <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Updated:</span>
                          <span className="font-medium">{formatDate(selectedOrder.updatedAt)}</span>
                        </div>
                        {selectedOrder.assignedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Assigned:</span>
                            <span className="font-medium">{formatDate(selectedOrder.assignedAt)}</span>
                          </div>
                        )}
                        {selectedOrderProcessingTime && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Processing Time:</span>
                            <span className="font-medium">{formatTime(selectedOrderProcessingTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FiDollarSign className="mr-2" />
                        Payment Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal:</span>
                          <span className="font-medium">
                            {formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery:</span>
                          <span className="font-medium">
                            {formatCurrency(selectedOrder.deliveryCharge, selectedOrder.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="text-gray-900 font-semibold">Total:</span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        {!selectedOrder.assignedUserId ? (
                          <Button onClick={() => handleAssignToSelf(selectedOrder)} className="w-full">
                            <FiUserCheck className="mr-2" />
                            Assign to Myself
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleUnassignOrder(selectedOrder)}
                            className="w-full"
                          >
                            <FiUserCheck className="mr-2" />
                            Unassign Order
                          </Button>
                        )}
                        <div className="relative">
                          <select
                            value={selectedOrder.status}
                            onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value as OrderStatus)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {Object.values(OrderStatusTypes).map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Order Items ({selectedOrder.items.length})</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <FiPackage className="text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{item.product?.name}</h5>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              {item?.product?.options?.length > 0 && (
                                <div className="text-xs text-neutral-500 mt-1">
                                  {item?.product?.options?.map((opt) => `${opt?.name}: ${opt.choice.label}`).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{item.totalPrice}</p>
                            <p className="text-xs text-gray-500">
                              Unit: {formatCurrency(item.product?.price || 0, selectedOrder.currency)}
                            </p>
                            {item?.product?.options?.some((opt) => parseInt(opt.choice.priceAdjustment) > 0) && (
                              <p className="text-xs text-neutral-500">
                                +
                                {formatCurrency(
                                  item.product?.options?.reduce(
                                    (sum, opt) => sum + parseInt(opt.choice.priceAdjustment),
                                    0
                                  ),
                                  selectedOrder.currency
                                )}{' '}
                                options
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for grid icon
const FiGrid: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 1h5v5H1V1zm0 7h5v5H1V8zm7-7h5v5H8V1zm0 7h5v5H8V8z" fillRule="evenodd" clipRule="evenodd" />
  </svg>
);

export default OrdersPage;
