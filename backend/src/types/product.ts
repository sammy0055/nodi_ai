import { ProductStatusTypes } from '../data/data-types';

export interface IProduct {
  id: string;
  organizationId: string;
  sku: string;
  status: `${ProductStatusTypes}`;
  name: string;
  price:number
  description: string;
  currency: string;
  metaProductId: string;
  imageUrl?: string;
  filePath?: string; // path in superbase storage
}
