import React, { useEffect, useState } from 'react';
import {
  FiSearch,
  FiFilter,
  FiEdit,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
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
  FiPhone,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useDebounce } from 'use-debounce';
import { useOrdersSetRecoilState, useOrdersValue } from '../../store/authAtoms';
import { OrderService } from '../../services/orderService';

// Order status object
export const OrderStatusTypes = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
} as const;

// Order source object
export const OrderSourceTypes = {
  CHATBOT: 'chatbot',
  WEBSITE: 'website',
  MOBILE_APP: 'mobile_app',
  API: 'api',
} as const;

// Optional: types derived from objects
export type OrderStatus = (typeof OrderStatusTypes)[keyof typeof OrderStatusTypes];
export type OrderSource = (typeof OrderSourceTypes)[keyof typeof OrderSourceTypes];

export interface OrderItemOption {
  optionId: string;
  optionName: string;
  choiceId: string;
  choiceLabel: string;
  priceAdjustment: number;
}

export interface OrderItem {
  productId: string;
  inventoryId: string;
  quantity: number;
  totalPrice: string;
  selectedOptions: OrderItemOption[];
  product: {
    name: string;
    price: number;
  };
}

export interface IOrder {
  id: string;
  title: string;
  customerId: string;
  organizationId: string;
  branchId: string;
  status: OrderStatus;
  source: OrderSource;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discountAmount?: number;
  totalAmount: number;
  currency: string;
  deliveryAreaId: string; // to be checked
  deliveryAreaName?: string;
  deliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  branch: {
    // populated values
    id: string;
    name: string;
  };
  customer: {
    // populated values
    id: string;
    name: string;
    phone: string;
  };
}

const OrdersPage: React.FC = () => {
  const orders = useOrdersValue();
  const setOrders = useOrdersSetRecoilState();

  //   const [orders, setOrders] = useState<IOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<IOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<OrderSource | 'all'>('all');
  const [isLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const { updateOrderStatus } = new OrderService();
  // Filter orders when search term, status, or source changes
  useEffect(() => {
    filterOrders();
  }, [debouncedSearchTerm, selectedStatus, selectedSource, orders]);

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          order.customer.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          order.customer.phone?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          order.branch.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter((order) => order.source === selectedSource);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      // Call API to update status
      await updateOrderStatus({ orderId, status: newStatus });

      // Update state immutably
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleViewOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatusTypes.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatusTypes.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatusTypes.PROCESSING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatusTypes.SHIPPED:
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatusTypes.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatusTypes.CANCELLED:
        return 'bg-red-100 text-red-800';
      case OrderStatusTypes.RETURNED:
        return 'bg-orange-100 text-orange-800';
      case OrderStatusTypes.REFUNDED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
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
      default:
        return <FiBox className="text-gray-600" />;
    }
  };

  const getSourceIcon = (source: OrderSource) => {
    switch (source) {
      case OrderSourceTypes.WEBSITE:
        return <FiGlobe className="text-blue-500" />;
      case OrderSourceTypes.MOBILE_APP:
        return <FiSmartphone className="text-green-500" />;
      case OrderSourceTypes.CHATBOT:
        return <FiMessageCircle className="text-purple-500" />;
      case OrderSourceTypes.API:
        return <FiShoppingBag className="text-orange-500" />;
      default:
        return <FiShoppingCart className="text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Order Row Component
  const OrderRow: React.FC<{ order: IOrder }> = ({ order }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border-b border-neutral-200 hover:bg-neutral-50">
      {/* Order Info - 4 columns */}
      <div className="md:col-span-4 flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          {getSourceIcon(order.source)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-neutral-900 truncate">{order.title || order.id}</h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusIcon(order.status)}
              <span className="ml-1 hidden sm:inline">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </span>
          </div>
          <p className="text-sm text-neutral-500 truncate flex items-center">
            <FiUser className="mr-1 text-neutral-400" size={12} />
            {order.customer.name}
          </p>
          <p className="text-xs text-neutral-400 truncate flex items-center">
            <FiPhone className="mr-1 text-neutral-400" size={12} />
            {order.customer.phone}
          </p>
        </div>
      </div>

      {/* Order Details - 3 columns */}
      <div className="md:col-span-3 hidden md:block">
        <div className="space-y-1 text-sm">
          <div className="flex items-center text-neutral-500">
            <FiMapPin className="mr-1" size={12} />
            <span className="truncate">{order.branch.name}</span>
          </div>
          <div className="flex items-center text-neutral-500">
            <FiCalendar className="mr-1" size={12} />
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="text-neutral-500">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Amount - 2 columns */}
      <div className="md:col-span-2 hidden md:block">
        <div className="text-right">
          <p className="text-lg font-bold text-neutral-900">{formatCurrency(order.totalAmount, order.currency)}</p>
          {order.discountAmount && order.discountAmount > 0 && (
            <p className="text-sm text-green-600">Saved {formatCurrency(order.discountAmount, order.currency)}</p>
          )}
        </div>
      </div>

      {/* Actions - 3 columns */}
      <div className="md:col-span-3 flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)} className="min-w-[80px]">
          <FiEye className="md:mr-1" />
          <span className="hidden md:inline">View</span>
        </Button>

        {/* Status Update Dropdown */}
        <div className="relative">
          <select
            value={order.status}
            onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
            disabled={updatingOrderId === order.id}
            className={`appearance-none bg-white border border-neutral-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              updatingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {Object.values(OrderStatusTypes).map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
            {updatingOrderId === order.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <FiEdit size={14} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile details */}
      <div className="md:hidden col-span-1 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-500">Branch</p>
            <p className="font-medium">{order.branch.name}</p>
          </div>
          <div>
            <p className="text-neutral-500">Items</p>
            <p className="font-medium">{order.items.length}</p>
          </div>
          <div>
            <p className="text-neutral-500">Date</p>
            <p className="font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-neutral-500">Total</p>
            <p className="font-medium">{formatCurrency(order.totalAmount, order.currency)}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
            <FiEye className="mr-1" />
            View Details
          </Button>

          <div className="relative">
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
              disabled={updatingOrderId === order.id}
              className={`appearance-none bg-white border border-neutral-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                updatingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {Object.values(OrderStatusTypes).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Orders Management</h2>
          <p className="text-neutral-600 mt-1">Manage and track customer orders</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-medium p-4">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders by ID, customer name, email, or branch..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-3">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'all')}
                className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none pr-8"
              >
                <option value="all">All Status</option>
                {Object.values(OrderStatusTypes).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <FiFilter size={14} />
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as OrderSource | 'all')}
                className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none pr-8"
              >
                <option value="all">All Sources</option>
                {Object.values(OrderSourceTypes).map((source) => (
                  <option key={source} value={source}>
                    {source
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <FiShoppingCart size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {/* Header Row - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-sm font-medium text-neutral-700">
          <div className="col-span-4">Order & Customer</div>
          <div className="col-span-3">Details</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {/* Orders Items */}
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
            <p>Loading orders...</p>
          </div>
        ) : currentOrders.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <FiBox className="mx-auto text-4xl text-neutral-300 mb-3" />
            <p>No orders found{searchTerm && ` matching "${searchTerm}"`}</p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {currentOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0">
            <div className="text-sm text-neutral-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <FiChevronLeft className="mr-1" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 rounded text-sm ${
                        pageNum === currentPage ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <FiChevronRight className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">Order Details - {selectedOrder.id}</h3>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Name:</span>
                        <span className="font-medium">{selectedOrder.customer.name}</span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span className="text-neutral-500">Email:</span>
                        <span className="font-medium">{selectedOrder.customerEmail}</span>
                      </div> */}
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Phone:</span>
                        <span className="font-medium">{selectedOrder.customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-900 mb-2">Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Branch:</span>
                        <span className="font-medium">{selectedOrder.branch.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Delivery Area:</span>
                        <span className="font-medium">{selectedOrder.deliveryAreaName}</span>
                      </div>
                      {/* {selectedOrder.deliveryZoneName && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Delivery Zone:</span>
                          <span className="font-medium">{selectedOrder.deliveryZoneName}</span>
                        </div>
                      )} */}
                      {selectedOrder.deliveryTime && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Scheduled Delivery:</span>
                          <span className="font-medium">{formatDate(selectedOrder.deliveryTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-2">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Status:</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1">
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Source:</span>
                        <span className="font-medium flex items-center">
                          {getSourceIcon(selectedOrder.source)}
                          <span className="ml-1">
                            {selectedOrder.source
                              .split('_')
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Created:</span>
                        <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Last Updated:</span>
                        <span className="font-medium">{formatDate(selectedOrder.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-900 mb-2">Payment Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}
                        </span>
                      </div>
                      {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Discount:</span>
                          <span className="font-medium text-green-600">
                            -{formatCurrency(selectedOrder.discountAmount, selectedOrder.currency)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Delivery Charge:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedOrder.deliveryCharge, selectedOrder.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-neutral-200 pt-2">
                        <span className="text-neutral-900 font-semibold">Total:</span>
                        <span className="text-lg font-bold text-primary-600">
                          {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <FiPackage className="text-primary-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-neutral-900">{item.product.name}</h5>
                            <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                            {item?.selectedOptions?.length > 0 && (
                              <div className="text-xs text-neutral-500 mt-1">
                                {item?.selectedOptions
                                  ?.map((opt) => `${opt.optionName}: ${opt.choiceLabel}`)
                                  .join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">{item.totalPrice}</p>
                        {item?.selectedOptions?.some((opt) => opt.priceAdjustment > 0) && (
                          <p className="text-xs text-neutral-500">
                            +
                            {formatCurrency(
                              item.selectedOptions?.reduce((sum, opt) => sum + opt.priceAdjustment, 0),
                              selectedOrder.currency
                            )}{' '}
                            options
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
