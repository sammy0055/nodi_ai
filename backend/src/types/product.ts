import { ProductStatusTypes } from '../data/data-types';

export interface IProduct {
  id: string;
  organizationId: string;
  sku: string;
  status: `${ProductStatusTypes}`;
  name: string;
  price:number
  description: string;
  currency: `${CurrencyCode}`;
  metaProductId: string;
  imageUrl?: string;
  filePath?: string; // path in superbase storage
  embedding?: number[];
}

export enum CurrencyCode {
  USD = 'USD', // US Dollar
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound
  JPY = 'JPY', // Japanese Yen
  CNY = 'CNY', // Chinese Yuan Renminbi
  CAD = 'CAD', // Canadian Dollar
  AUD = 'AUD', // Australian Dollar
  CHF = 'CHF', // Swiss Franc
  INR = 'INR', // Indian Rupee
  NGN = 'NGN', // Nigerian Naira
  ZAR = 'ZAR', // South African Rand
  KES = 'KES', // Kenyan Shilling
  GHS = 'GHS', // Ghanaian Cedi
  SAR = 'SAR', // Saudi Riyal
  AED = 'AED', // UAE Dirham
  EGP = 'EGP', // Egyptian Pound
  TRY = 'TRY', // Turkish Lira
  SGD = 'SGD', // Singapore Dollar
  HKD = 'HKD', // Hong Kong Dollar
  BRL = 'BRL', // Brazilian Real
  MXN = 'MXN', // Mexican Peso
  RUB = 'RUB', // Russian Ruble
  KRW = 'KRW', // South Korean Won
  IDR = 'IDR', // Indonesian Rupiah
  MYR = 'MYR', // Malaysian Ringgit
  LBP = 'LBP', // Lebanese Pound (Lira)
}

