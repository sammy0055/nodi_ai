type OrderType = 'delivery' | 'takeaway';

interface GenerateTextArgs {
  type: OrderType;
  items: string[];
  total: number;
  deliveryCharge?: number;
  address?: string;
  area?: string;
  branch?: string;
  estimatedTime?: string;
  currency?: string; // e.g. "NGN", "USD", "SAR"
}

// helper: format numbers per locale
const formatAmount =
  (locale: 'en' | 'ar', currency = 'NGN') =>
  (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency,
    }).format(value);

// curried generator
export const generateOrderText = (locale: 'en' | 'ar') => (args: GenerateTextArgs) => {
  const {
    type,
    items,
    total,
    deliveryCharge = 0,
    address = '',
    area = '',
    branch = '',
    estimatedTime = '',
    currency = 'NGN',
  } = args;

  const format = formatAmount(locale, currency);

  const itemsText = items.map((item, i) => `${i + 1}. ${item}`).join('\n');

  const t = {
    en: {
      delivery: 'Delivery',
      takeaway: 'Takeaway',
      address: 'Address',
      area: 'Area',
      items: 'Items',
      deliveryCharge: 'Delivery Charge',
      total: 'Total',
      eta: args.type === 'delivery' ? 'Estimated Delivery Time' : 'Estimated Takeaway Time',
      branch: 'Branch',
    },
    ar: {
      delivery: 'توصيل',
      takeaway: 'استلام',
      address: 'العنوان',
      area: 'المنطقة',
      items: 'الطلبات',
      deliveryCharge: 'رسوم التوصيل',
      total: 'الإجمالي',
      eta: args.type === 'delivery' ? 'وقت التوصيل المتوقع' : 'وقت الاستلام المتوقع',
      branch: 'الفرع',
    },
  }[locale];

  let text = '';

  if (type === 'delivery') {
    text += `${t.delivery}\n-------------------\n`;
    text += `${t.address}: ${address}\n`;
    text += `${t.area}: ${area}\n\n`;
    text += `${t.items}:\n${itemsText}\n\n`;

    if (deliveryCharge > 0) {
      text += `${t.deliveryCharge}: ${format(deliveryCharge)}\n`;
    }

    text += `${t.total}: ${format(total)}\n\n`;
    text += `${t.eta}: ${estimatedTime}`;
  } else {
    text += `${t.takeaway}\n-------------------\n`;
    text += `${t.branch}: ${branch}\n\n`;
    text += `${t.items}:\n${itemsText}\n\n`;
    text += `${t.total}: ${format(total)}`;
    text += `${t.eta}: ${estimatedTime}`;
  }

  return text;
};

// usage
export const generateEnOrderSummaryText = generateOrderText('en');
export const generateArOrderSummaryText = generateOrderText('ar');

// example
// const enText = generateEn({
//   type: 'delivery',
//   items: ['Burger', 'Fries'],
//   total: 5000,
//   deliveryCharge: 1000,
//   address: '12 Allen Ave',
//   area: 'Ikeja',
//   estimatedTime: '30 mins',
//   currency: 'NGN',
// });

// const arText = generateAr({
//   type: 'delivery',
//   items: ['برجر', 'بطاطس'],
//   total: 5000,
//   deliveryCharge: 1000,
//   address: '١٢ شارع ألين',
//   area: 'إيكجا',
//   estimatedTime: '٣٠ دقيقة',
//   currency: 'NGN',
// });
