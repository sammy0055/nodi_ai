export enum OrderStatusTypes {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
  PARTIALLY_DELIVERED = 'partially_delivered',
  AWAITING_PAYMENT = 'awaiting_payment',
  PAYMENT_FAILED = 'payment_failed',
  AWAITING_FULFILLMENT = 'awaiting_fulfillment',
}
export enum OrderSourceTypes {
  CHATBOT = 'chatbot',
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  API = 'api',
}

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
  productName: string;
  quantity: number;
  totalPrice: string;
  selectedOptions: OrderItemOption[];
}
export interface IOrder {
  id: string;
  customerId: string;
  organizationId: string;
  branchId: string;
  status: `${OrderStatusTypes}`;
  source: `${OrderSourceTypes}`;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  deliveryCharge: number; // New: delivery charge from area
  discountAmount?: number;
  totalAmount: number;
  currency: string;
  deliveryAreaId?: string;
  deliveryAreaName?: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryTime?: Date;
}
