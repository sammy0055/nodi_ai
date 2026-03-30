import { ProductOptionDefinition } from '../../types/common';
import { BusinessType } from '../data-types';

export const productOptionsTaxonomy: Record<BusinessType, ProductOptionDefinition[]> = {
  restaurant: [
    {
      label: 'Add Ingredient',
      description: 'Add an extra ingredient to the product. Example: add cheese, add bacon, add olives.',
      selectionType: 'multi-select',
    },
    {
      label: 'Remove Ingredient',
      description: 'Remove an existing ingredient from the product. Example: no onions, no pickles.',
      selectionType: 'multi-select',
    },
    {
      label: 'Add Side',
      description: 'Add a side item to the order. Example: add imported fries, add coleslaw.',
      selectionType: 'multi-select',
    },
    {
      label: 'Add Drink',
      description: 'Add a beverage to the order. Example: add Pepsi, add Coke, add water.',
      selectionType: 'multi-select',
    },
    {
      label: 'Spice Level',
      description: 'Adjust how spicy the food should be. Example: mild, medium, extra spicy.',
      selectionType: 'single-select',
    },
    {
      label: 'Cooking Preference',
      description: 'Specify how the food should be cooked. Example: well done, medium rare.',
      selectionType: 'single-select',
    },
    {
      label: 'Size',
      description: 'Select size. Example: regular, large, family size.',
      selectionType: 'single-select',
    },
    {
      label: 'Add Sauce',
      description: 'Add extra sauce. Example: extra garlic sauce, extra ketchup.',
      selectionType: 'multi-select',
    },
    {
      label: 'Remove Sauce',
      description: 'Remove a sauce from the product. Example: no mayo, no BBQ sauce.',
    },
    {
      label: 'Extra Protein',
      description: 'Increase protein quantity. Example: double chicken, extra beef.',
      selectionType: 'multi-select',
    },
    {
      label: 'Special Instructions',
      description: 'Free-text instructions from customer. Example: cut in half, pack separately.',
    },
  ],

  cafe: [
    {
      label: 'Milk Type',
      description: 'Choose the type of milk. Example: almond milk, oat milk, skim milk.',
    },
    {
      label: 'Add Milk',
      description: 'Add milk to the drink. Example: add milk to tea.',
    },
    {
      label: 'Remove Milk',
      description: 'Remove milk from the drink. Example: black coffee, no milk.',
    },
    {
      label: 'Sweetness Level',
      description: 'Adjust sugar level. Example: no sugar, less sugar, extra sweet.',
    },
    {
      label: 'Size',
      description: 'Select drink size. Example: small, medium, large.',
    },
    {
      label: 'Extra Shot',
      description: 'Add extra espresso shot. Example: double shot cappuccino.',
    },
    {
      label: 'Flavor Syrup',
      description: 'Add flavored syrup. Example: vanilla syrup, caramel syrup.',
    },
    {
      label: 'Ice Level',
      description: 'Control amount of ice. Example: no ice, less ice, extra ice.',
    },
    {
      label: 'Add Topping',
      description: 'Add toppings. Example: whipped cream, chocolate powder.',
    },
    {
      label: 'Add Pastry',
      description: 'Add a bakery item to the order. Example: croissant, muffin.',
    },
    {
      label: 'Special Instructions',
      description: 'Free-text customer instruction. Example: serve very hot, no lid.',
    },
  ],

  barbershop: [],
  'beauty-salon': [],
  'ladies-wear': [],
  'men-wear': [],
  'clothing-store': [],
  'shoe-store': [],
  'electronics-store': [],
  'mobile-shop': [],
  supermarket: [],
  bakery: [],
  pharmacy: [],
  clinic: [],
  dentist: [],
  gym: [],
  spa: [],
  mechanic: [],
  'car-wash': [],
  bookstore: [],
  'gift-shop': [],
  'furniture-store': [],
  ecommerce: [],
  other: [],
};
