[
  {
    brand: 'Redmi',
    model: 'Note 14 Pro Max 5G',
    price_NGN: 485000,
    description:
      'Flagship-level specs: 200 MP main camera, 6200-8000mAh battery, 120W fast charging. :contentReference[oaicite:0]{index=0}',
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S25 Ultra 5G',
    price_NGN: 1499000,
    description:
      'Top-tier flagship: 6.9″ AMOLED display, 200 MP quad-camera, Snapdragon 8 Elite chip, premium build and long update support. :contentReference[oaicite:1]{index=1}',
  },
  {
    brand: 'Apple',
    model: 'iPhone 17',
    price_NGN: 1250000,
    description:
      'Flagship Apple phone with A19 chip, 6.3-inch Super Retina XDR OLED display at 120Hz, 48MP main + 48MP ultra-wide cameras, IP68 rating. :contentReference[oaicite:1]{index=1}',
  },
  {
    id: 'tawook_sandwich',
    name: 'Tawook Sandwich',
    category: 'Sandwiches',
    price_LBP: 250000,
    description: 'Grilled chicken wrapped with garlic sauce, pickles, and fries in soft pita bread.',
    ingredients: ['Grilled Chicken', 'Garlic Sauce', 'Pickles', 'Fries', 'Pita Bread'],
    options: {
      portion_size: ['Regular', 'Large'],
      bread_type: ['Pita', 'Markouk'],
      toppings_remove: ['Garlic Sauce', 'Pickles', 'Fries'],
      toppings_add: [
        { name: 'Extra Chicken', price_LBP: 50000 },
        { name: 'Extra Garlic Sauce', price_LBP: 15000 },
        { name: 'Cheese Slice', price_LBP: 20000 },
      ],
    },
  },
  {
    id: 'beef_shawarma_plate',
    name: 'Beef Shawarma Plate',
    category: 'Plates',
    price_LBP: 450000,
    description: 'Slices of seasoned beef shawarma served with hummus, fresh vegetables, and bread.',
    ingredients: ['Beef Shawarma', 'Hummus', 'Pickles', 'Tomato', 'Onion', 'Bread'],
    options: {
      portion_size: ['Regular', 'Large'],
      toppings_remove: ['Onion', 'Tomato'],
      toppings_add: [
        { name: 'Extra Meat', price_LBP: 70000 },
        { name: 'Extra Hummus', price_LBP: 20000 },
        { name: 'Fries', price_LBP: 15000 },
      ],
    },
  },
  {
    id: 'zaatar_manouche',
    name: 'Zaatar Manoushe',
    category: 'Bakery',
    price_LBP: 180000,
    description: 'Traditional manoushe topped with zaatar blend and olive oil, baked fresh.',
    ingredients: ['Zaatar Mix', 'Olive Oil', 'Dough'],
    options: {
      portion_size: ['Regular', 'Large'],
      toppings_add: [
        { name: 'Cheese Mix', price_LBP: 30000 },
        { name: 'Vegetables Mix', price_LBP: 10000 },
      ],
    },
  },
];
