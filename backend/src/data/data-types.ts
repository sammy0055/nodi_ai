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
  { key: 'order.asign', description: 'Asign order to a user for processing' },
  { key: 'order.unasign', description: 'Unasign order from a user' },

  { key: 'product.create', description: 'Add new products to the catalog' },
  { key: 'product.update', description: 'Edit product details, pricing, and availability' },
  { key: 'product.delete', description: 'Remove products from the catalog' },
  { key: 'product.view', description: 'View product information and listings' },

  { key: 'inventory.view', description: 'View inventory levels and stock status' },
  { key: 'inventory.update', description: 'Update stock quantities and adjustments' },
  { key: 'inventory.delete', description: 'Remove inventory' },

  { key: 'user.create', description: 'Create and onboard new users or staff accounts' },
  { key: 'user.update', description: 'Update user details and profile information' },
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

  { key: 'zone.create', description: 'Create a new zone in the system' },
  { key: 'zone.update', description: 'Update zone details and boundaries' },
  { key: 'zone.view', description: 'View all zones and their assignments' },
  { key: 'zone.delete', description: 'Delete an existing zone from the system' },

  { key: 'review.create', description: 'Add a new customer or product review' },
  { key: 'review.update', description: 'Edit existing reviews or feedback' },
  { key: 'review.view', description: 'View all reviews and ratings' },
  { key: 'review.delete', description: 'Remove inappropriate or outdated reviews' },

  { key: 'faq.create', description: 'Create a new FAQ entry' },
  { key: 'faq.update', description: 'Update FAQ content and categories' },
  { key: 'faq.view', description: 'View all FAQs and their details' },
  { key: 'faq.delete', description: 'Delete outdated or incorrect FAQ entries' },

  { key: 'billing.create', description: 'Create new invoices or billing records' },
  { key: 'billing.update', description: 'Update billing details or invoice amounts' },
  { key: 'billing.view', description: 'View all billing records and transactions' },
  { key: 'billing.delete', description: 'Delete incorrect or duplicate billing records' },

  { key: 'permission.update', description: 'Update existing permission details' },
  { key: 'permission.view', description: 'View all permissions and their assignments' },
  { key: 'permission.delete', description: 'Delete permissions from the system' },

  { key: 'dashboard.view', description: 'View the main dashboard and its summaries' },

  { key: 'settings.view', description: 'View application settings' },
  { key: 'settings.update', description: 'Edit and update application settings' },

  { key: 'service_schedule.view', description: 'View service schedules and details' },
  { key: 'service_schedule.update', description: 'Edit and update service schedules' },
];

export const supportedBusinessTypes = Object.values(BusinessType);
