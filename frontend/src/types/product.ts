export interface Product {
  id: string;
  organizationId: string;
  sku: string;
  status: 'active' | 'draft' | 'archived';
  name: string;
  price: number;
  description: string;
  currency: string;
  metaProductId: string;
  imageUrl?: string;
  file?: File;
  options?: ProductOption[];
}

export interface ProductOptionChoice {
  id: string;
  productOptionId: string;
  label: string;
  priceAdjustment: number;
  isDefault: boolean;
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  type: 'single' | 'multiple';
  isRequired: boolean;
  minSelection?: number;
  maxSelection?: number;
  choices?: ProductOptionChoice[];
}

export const CurrencyCode = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  CNY: 'CNY',
  CAD: 'CAD',
  AUD: 'AUD',
  CHF: 'CHF',
  INR: 'INR',
  NGN: 'NGN',
  ZAR: 'ZAR',
  KES: 'KES',
  GHS: 'GHS',
  SAR: 'SAR',
  AED: 'AED',
  EGP: 'EGP',
  TRY: 'TRY',
  SGD: 'SGD',
  HKD: 'HKD',
  BRL: 'BRL',
  MXN: 'MXN',
  RUB: 'RUB',
  KRW: 'KRW',
  IDR: 'IDR',
  MYR: 'MYR',
  LBP: 'LBP',
} as const;

export type CurrencyCode = (typeof CurrencyCode)[keyof typeof CurrencyCode];
export const CurrencySymbols: Record<CurrencyCode, string> = {
  [CurrencyCode.USD]: '$',
  [CurrencyCode.EUR]: '€',
  [CurrencyCode.GBP]: '£',
  [CurrencyCode.JPY]: '¥',
  [CurrencyCode.CNY]: '¥',
  [CurrencyCode.CAD]: '$',
  [CurrencyCode.AUD]: '$',
  [CurrencyCode.CHF]: 'CHF',
  [CurrencyCode.INR]: '₹',
  [CurrencyCode.NGN]: '₦',
  [CurrencyCode.ZAR]: 'R',
  [CurrencyCode.KES]: 'KSh',
  [CurrencyCode.GHS]: '₵',
  [CurrencyCode.SAR]: 'ر.س',
  [CurrencyCode.AED]: 'د.إ',
  [CurrencyCode.EGP]: '£',
  [CurrencyCode.TRY]: '₺',
  [CurrencyCode.SGD]: '$',
  [CurrencyCode.HKD]: '$',
  [CurrencyCode.BRL]: 'R$',
  [CurrencyCode.MXN]: '$',
  [CurrencyCode.RUB]: '₽',
  [CurrencyCode.KRW]: '₩',
  [CurrencyCode.IDR]: 'Rp',
  [CurrencyCode.MYR]: 'RM',
  [CurrencyCode.LBP]: 'ل.ل',
};
