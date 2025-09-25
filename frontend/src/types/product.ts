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
  file?:File
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