export interface ProductOptionDefinition {
  label: string;
  description: string;
  name: string;
  selectionType?: 'single-select' | 'multi-select';
}
