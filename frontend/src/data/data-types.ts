export type UserTypes =
  | "owner"
  | "admin"   // Full system control
  | "manager" // Manages branches/employees
  | "staff";  // Regular employee

export type WhatSappConnectionStatus =
  | "connected"
  | "not-connected"
  | "disconnected";

export type BusinessType =
  | "restaurant"
  | "cafe"
  | "barbershop"
  | "beauty-salon"
  | "ladies-wear"
  | "men-wear"
  | "clothing-store"
  | "shoe-store"
  | "electronics-store"
  | "mobile-shop"
  | "supermarket"
  | "bakery"
  | "pharmacy"
  | "clinic"
  | "dentist"
  | "gym"
  | "spa"
  | "mechanic"
  | "car-wash"
  | "bookstore"
  | "gift-shop"
  | "furniture-store"
  | "ecommerce"
  | "other";
