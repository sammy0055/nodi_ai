export interface ProductChoice {
  choice_key: string;
  option_key: string;
  label: string;
  priceAjustment: number;
}

export interface ProductOption {
  option_key: string;
  product_key: string;
  name: string;
  type: 'single' | 'multiple';
  choices: ProductChoice[];
}

export interface Product {
  name: string;
  description: string;
  price: number;
  image_name: string;
  product_key: string;
  product_id: string | null;
  options: ProductOption[];
}
