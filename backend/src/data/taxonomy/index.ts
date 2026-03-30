import { ProductOptionDefinition } from '../../types/common';
import { BusinessType } from '../data-types';

export const productOptionsTaxonomy: Record<BusinessType, ProductOptionDefinition[]> = {
  restaurant: [
    {
      label: 'Add Ingredient',
      name: 'Add_Ingredient',
      description: 'Add an extra ingredient to the product. Example: add cheese, add bacon, add olives.',
      selectionType: 'multi-select',
    },
    {
      label: 'Remove Ingredient',
      name: 'Remove_Ingredient',
      description: 'Remove an existing ingredient from the product. Example: no onions, no pickles.',
      selectionType: 'multi-select',
    },
    {
      label: 'Add Side',
      name: 'Add_Side',
      description: 'Add a side item to the order. Example: add imported fries, add coleslaw.',
      selectionType: 'multi-select',
    },
    {
      label: 'Add Drink',
      name: 'Add_Drink',
      description: 'Add a beverage to the order. Example: add Pepsi, add Coke, add water.',
      selectionType: 'multi-select',
    },
    {
      label: 'Spice Level',
      name: 'Spice_Level',
      description: 'Adjust how spicy the food should be. Example: mild, medium, extra spicy.',
      selectionType: 'single-select',
    },
    {
      label: 'Cooking Preference',
      name: 'Cooking_Preference',
      description: 'Specify how the food should be cooked. Example: well done, medium rare.',
      selectionType: 'single-select',
    },
    {
      label: 'Size',
      name: 'Size',
      description: 'Select size. Example: regular, large, family size.',
      selectionType: 'single-select',
    },
    {
      label: 'Add Sauce',
      name: 'Add_Sauce',
      description: 'Add extra sauce. Example: extra garlic sauce, extra ketchup.',
      selectionType: 'multi-select',
    },
    {
      label: 'Remove Sauce',
      name: 'Remove_Sauce',
      description: 'Remove a sauce from the product. Example: no mayo, no BBQ sauce.',
    },
    {
      label: 'Extra Protein',
      name: 'Extra_Protein',
      description: 'Increase protein quantity. Example: double chicken, extra beef.',
      selectionType: 'multi-select',
    },
    {
      label: 'Special Instructions',
      name: 'Special_Instructions',
      description: 'Free-text instructions from customer. Example: cut in half, pack separately.',
    },
  ],

  cafe: [
    {
      label: 'Milk Type',
       name: 'Add_Ingredient',
      description: 'Choose the type of milk. Example: almond milk, oat milk, skim milk.',
    },
    {
      label: 'Add Milk',
       name: 'Add_Ingredient',
      description: 'Add milk to the drink. Example: add milk to tea.',
    },
    {
      label: 'Remove Milk',
       name: 'Add_Ingredient',
      description: 'Remove milk from the drink. Example: black coffee, no milk.',
    },
    {
      label: 'Sweetness Level',
       name: 'Add_Ingredient',
      description: 'Adjust sugar level. Example: no sugar, less sugar, extra sweet.',
    },
    {
      label: 'Size',
       name: 'Add_Ingredient',
      description: 'Select drink size. Example: small, medium, large.',
    },
    {
      label: 'Extra Shot',
       name: 'Add_Ingredient',
      description: 'Add extra espresso shot. Example: double shot cappuccino.',
    },
    {
      label: 'Flavor Syrup',
       name: 'Add_Ingredient',
      description: 'Add flavored syrup. Example: vanilla syrup, caramel syrup.',
    },
    {
      label: 'Ice Level',
       name: 'Add_Ingredient',
      description: 'Control amount of ice. Example: no ice, less ice, extra ice.',
    },
    {
      label: 'Add Topping',
       name: 'Add_Ingredient',
      description: 'Add toppings. Example: whipped cream, chocolate powder.',
    },
    {
      label: 'Add Pastry',
       name: 'Add_Ingredient',
      description: 'Add a bakery item to the order. Example: croissant, muffin.',
    },
    {
      label: 'Special Instructions',
       name: 'Add_Ingredient',
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
