export enum OrderStatusTypes {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
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
  deliveryCharge: number; // New: delivery charge from area
  discountAmount?: number;
  totalAmount: number;
  currency: string;
  deliveryAreaId?: string;
  deliveryAreaName?: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryTime?: Date;
  shippingAddress: string;
}
