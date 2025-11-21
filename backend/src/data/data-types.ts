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
  Pending = "pending"
}

export enum UserTypes {
  Owner = 'owner',
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

export const supportedBusinessTypes = Object.values(BusinessType);
