import { useEffect, useState } from 'react';
import {
  FiActivity,
  FiBox,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiGlobe,
  FiMessageCircle,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiShoppingCart,
  FiSmartphone,
  FiTruck,
  FiUser,
  FiUserCheck,
  FiXCircle,
} from 'react-icons/fi';
import { OrderService } from '../../../services/orderService';
import { OrderSourceTypes, type OrderSource, type OrderStatus } from '../Organization';
import { OrderStatusTypes, type IOrder, type OrderPriority } from '../../../pages/tenant/OrderPage';
// import Button from '../../../components/ui/Button'; // adjust import path as needed

// Helper functions (you may already have them in a utils file)
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatusTypes.PENDING:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    // case OrderStatusTypes.CONFIRMED:
    //   return 'bg-blue-50 text-blue-700 border-blue-200';
    case OrderStatusTypes.PROCESSING:
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case OrderStatusTypes.SHIPPED:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case OrderStatusTypes.DELIVERED:
      return 'bg-green-50 text-green-700 border-green-200';
    case OrderStatusTypes.CANCELLED:
      return 'bg-red-50 text-red-700 border-red-200';
    // case OrderStatusTypes.RETURNED:
    //   return 'bg-orange-50 text-orange-700 border-orange-200';
    // case OrderStatusTypes.REFUNDED:
    //   return 'bg-gray-50 text-gray-700 border-gray-200';
    // case OrderStatusTypes.ON_HOLD:
    //   return 'bg-pink-50 text-pink-700 border-pink-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatusTypes.PENDING:
      return <FiClock className="text-yellow-600" />;
    // case OrderStatusTypes.CONFIRMED:
    //   return <FiCheckCircle className="text-blue-600" />;
    case OrderStatusTypes.PROCESSING:
      return <FiRefreshCw className="text-purple-600" />;
    case OrderStatusTypes.SHIPPED:
      return <FiTruck className="text-indigo-600" />;
    case OrderStatusTypes.DELIVERED:
      return <FiPackage className="text-green-600" />;
    case OrderStatusTypes.CANCELLED:
      return <FiXCircle className="text-red-600" />;
    // case OrderStatusTypes.RETURNED:
    //   return <FiRefreshCw className="text-orange-600" />;
    // case OrderStatusTypes.REFUNDED:
    //   return <FiDollarSign className="text-gray-600" />;
    // case OrderStatusTypes.ON_HOLD:
    //   return <FiAlertCircle className="text-pink-600" />;
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
    case OrderSourceTypes.WALK_IN:
      return <FiUser className="text-teal-500" />;
    default:
      return <FiShoppingCart className="text-gray-500" />;
  }
};

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

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const formatTime = (seconds: number) => {
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
};

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

interface OrderDetailsModalProps {
  orderId: string;
  isOpen: boolean; // rename from showOrderModal for clarity
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, isOpen, onClose }) => {
  const [orderDetails, setOrderDetails] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const { getOrder } = new OrderService();

  useEffect(() => {
    if (!orderId || !isOpen) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await getOrder({ orderId });
        setOrderDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId, isOpen]);

  if (!isOpen) return null;

  // Derived values
  const orderProcessingTime = orderDetails?.assignedAt
    ? Math.floor(
        (new Date(orderDetails.updatedAt).getTime() - new Date(orderDetails.assignedAt).getTime()) / (1000 * 60)
      )
    : undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {loading ? 'Loading...' : `Order ${orderDetails?.orderNumber || ''}`}
            </h3>
            {orderDetails && (
              <p className="text-sm text-gray-600 mt-1">
                {orderDetails.customer.name} • {orderDetails.customer.phone}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FiXCircle size={24} />
          </button>
        </div>

        {/* Content */}
        {loading && <div className="p-12 text-center text-gray-500">Loading order details...</div>}

        {!loading && orderDetails && (
          <div className="p-6 space-y-6">
            {/* Order Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer & Service Info */}
              <div className="space-y-4">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiUser className="mr-2" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{orderDetails.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{orderDetails.customer.phone}</span>
                    </div>
                    {orderDetails.customer.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium">{orderDetails.customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    {orderDetails.serviceType === 'delivery' ? (
                      <FiTruck className="mr-2" />
                    ) : (
                      <FiPackage className="mr-2" />
                    )}
                    {orderDetails.serviceType === 'delivery' ? 'Delivery Information' : 'Pickup Information'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Branch:</span>
                      <span className="font-medium">{orderDetails.branch.name}</span>
                    </div>
                    {orderDetails.area && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Zone:</span>
                          <span className="font-medium">{orderDetails.area.zone.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Area:</span>
                          <span className="font-medium">{orderDetails.area.name}</span>
                        </div>
                      </>
                    )}
                    {orderDetails.serviceType === 'delivery' && orderDetails.shippingAddress && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Address:</span>
                        <span className="font-medium">{orderDetails.shippingAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Timeline */}
              <div className="space-y-4">
                {/* Order Status */}
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
                          orderDetails.status
                        )}`}
                      >
                        {getStatusIcon(orderDetails.status)}
                        <span className="ml-1 capitalize">{orderDetails.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Priority:</span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          orderDetails.priority
                        )}`}
                      >
                        {orderDetails.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Source:</span>
                      <span className="font-medium flex items-center">
                        {getSourceIcon(orderDetails.source)}
                        <span className="ml-1 capitalize">{orderDetails.source.replace('_', ' ')}</span>
                      </span>
                    </div>
                    {orderDetails.assignedUserName && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Assigned to:</span>
                        <span className="font-medium flex items-center">
                          <FiUserCheck className="mr-1" />
                          {orderDetails.assignedUserName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiCalendar className="mr-2" />
                    Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">{formatDate(orderDetails.createdAt as any)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Updated:</span>
                      <span className="font-medium">{formatDate(orderDetails.updatedAt as any)}</span>
                    </div>
                    {orderDetails.assignedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Assigned:</span>
                        <span className="font-medium">{formatDate(orderDetails.assignedAt as any)}</span>
                      </div>
                    )}
                    {orderProcessingTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Processing Time:</span>
                        <span className="font-medium">{formatTime(orderProcessingTime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment & Actions */}
              <div className="space-y-4">
                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiDollarSign className="mr-2" />
                    Payment Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(orderDetails.subtotal, orderDetails.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery:</span>
                      <span className="font-medium">
                        {formatCurrency(orderDetails.deliveryCharge, orderDetails.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-900 font-semibold">Total:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(orderDetails.totalAmount, orderDetails.currency)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Order Items ({orderDetails.items.length})</h4>
              <div className="space-y-3">
                {orderDetails.items.map((item:any, index:any) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FiPackage className="text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{item.product?.name}</h5>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          {item.product?.options?.length > 0 && (
                            <div className="text-xs text-neutral-500 mt-1">
                              {item.product.options.map((opt:any) => `${opt?.name}: ${opt.choice.label}`).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {/* <p className="font-semibold text-gray-900">{item.totalPrice}</p> */}
                        <p className="text-xs text-gray-500">
                          Unit: {formatCurrency(Number(item.product?.price || 0), orderDetails.currency)}
                        </p>
                        {item.product?.options?.some((opt:any) => parseInt(opt.choice.priceAdjustment) > 0) && (
                          <p className="text-xs text-neutral-500">
                            +
                            {formatCurrency(
                              item.product.options.reduce((sum:any, opt:any) => sum + parseInt(opt.choice.priceAdjustment), 0),
                              orderDetails.currency
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
        )}
      </div>
    </div>
  );
};
