export interface ProductOption {
  id: string;
  productId: string;
  name: string; // "Size", "Toppings", "Cooking Preference"
  type: 'single' | 'multiple'; // single = one choice (radio), multiple = many (checkbox)
  isRequired: boolean; // must pick at least one? (true/false)
  minSelection?: number;
  maxSelection?: number;
  choices?: ProductOptionChoice[];
}

export interface ProductOptionChoice {
  id: string;
  productOptionId: string;
  label: string; // "Small", "No Salt", "Extra Cheese"
  priceAdjustment: number; // +2.50, -1.00, or 0
  isDefault: boolean;
}
