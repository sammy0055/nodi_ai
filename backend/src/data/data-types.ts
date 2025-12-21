export enum BusinessType {
  Restaurant = 'restaurant',
  Cafe = 'cafe',
  Barbershop = 'barbershop',
  BeautySalon = 'beauty-salon',
  LadiesWear = 'ladies-wear',
  MenWear = 'men-wear',
  ClothingStore = 'clothing-store',
  ShoeStore = 'shoe-store',
  ElectronicsStore = 'electronics-store',
  MobileShop = 'mobile-shop',
  Supermarket = 'supermarket',
  Bakery = 'bakery',
  Pharmacy = 'pharmacy',
  Clinic = 'clinic',
  Dentist = 'dentist',
  Gym = 'gym',
  Spa = 'spa',
  Mechanic = 'mechanic',
  CarWash = 'car-wash',
  Bookstore = 'bookstore',
  GiftShop = 'gift-shop',
  FurnitureStore = 'furniture-store',
  Ecommerce = 'ecommerce',
  Other = 'other',
}

export enum WhatSappConnectionStatus {
  Connected = 'connected',
  NotConnected = 'not-connected',
  Disconnected = 'disconnected',
  Pending = 'pending',
}

export enum UserTypes {
  SuperAdmin = 'super-admin',
  Admin = 'admin', // Full system control
  Manager = 'manager', // Manages branches/employees
  Staff = 'staff', // Regular employee
}

export enum ProductStatusTypes {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export enum SubstriptionStatusTypes {
  active = 'active',
  cancelled = 'cancelled',
  expired = 'expired',
  pending = 'pending',
}

export enum CreditTransactionTypes {
  credit_add = 'creditAdd',
  credit_use = 'creditUse',
  credit_expire = 'creditExpire',
}

export enum ProductOptionTypes {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum RelatedNotificationEntity {
  Billing = 'billing',
  Product = 'product',
  SYSTEM = 'system',
  SUBSCRIPTION = 'subscription',
  ORGANIZATION = 'organization',
  ORDER = 'order',
  USER = 'user',
}

export enum RelatedEntityType {
  CatalogRequest = 'CatalogRequest',
  ProductRequest = 'ProductRequest',
  OrderRequest = 'OrderRequest',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DISMISSED = 'dismissed',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum UserRole {
  TENANT_ADMIN = 'tenant_admin',
  TENANT_USER = 'tenant_user',
  APP_ADMIN = 'app_admin',
}

export const permissions = [
  { key: 'order.create', description: 'Create a new customer order in the system' },
  { key: 'order.process', description: 'Process and update the status of an order' },
  { key: 'order.cancel', description: 'Cancel an existing order' },
  { key: 'order.view', description: 'View order details and order history' },

  { key: 'product.create', description: 'Add new products to the catalog' },
  { key: 'product.update', description: 'Edit product details, pricing, and availability' },
  { key: 'product.delete', description: 'Remove products from the catalog' },
  { key: 'product.view', description: 'View product information and listings' },

  { key: 'inventory.view', description: 'View inventory levels and stock status' },
  { key: 'inventory.update', description: 'Update stock quantities and adjustments' },
  { key: 'inventory.transfer', description: 'Transfer inventory between branches' },

  { key: 'user.create', description: 'Create and onboard new users or staff accounts' },
  { key: 'user.update', description: 'Update user details and profile information' },
  { key: 'user.assignRole', description: 'Assign roles and permissions to users' },
  { key: 'user.view', description: 'View user accounts and roles' },
  { key: 'user.deactivate', description: 'Deactivate or suspend user accounts' },

  { key: 'branch.create', description: 'Create a new business branch' },
  { key: 'branch.update', description: 'Update branch details and settings' },
  { key: 'branch.view', description: 'View branch information and performance' },
  { key: 'branch.delete', description: 'Remove a branch from the system' },

  { key: 'area.create', description: 'Create a new operational or delivery area' },
  { key: 'area.update', description: 'Update area details and coverage' },
  { key: 'area.view', description: 'View areas and assigned branches' },
  { key: 'area.delete', description: 'Delete an operational or delivery area' },
];

export const supportedBusinessTypes = Object.values(BusinessType);
