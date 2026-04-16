type Language = 'en' | 'ar';

export type FlowType =
  | 'greeting-flow'
  | 'choose-lang-flow'
  | 'branch-flow'
  | 'area-and-zone-flow'
  | 'catalog-flow'
  | 'customize-order-flow'
  | 'select-items-flow'
  | 'select-ordered-item-flow'
  | 'product-option-flow'
  | 'single-upselling-flow'
  | 'multi-upselling-flow'
  | 'order-summary-flow';

export interface FlowContent {
  headingText: string;
  bodyText: string;
  footerText: string;
  buttonText: string;
}

export interface GreetingsFlowContent {
  headingText: string;
  bodyText: string;
  footerText: string;
  buttonText: string;
  menuItems: { id: string; title: string; description: string }[];
}
export interface ChooseLangeContent {
  headingText: string;
  bodyText: string;
  footerText: string;
  buttonTexts: { id: string; title: string }[];
}
export interface SingleUpsellingContent {
  headingText: string;
  bodyText: string;
  footerText: string;
  buttonTexts: { id: string; title: string }[];
}
export interface OrderSummaryContent {
  headingText: string;
  bodyText: string;
  footerText: string;
  buttonTexts: { id: string; title: string }[];
}

export interface CustomizeOrderContent extends ChooseLangeContent {}

type FlowContentMap = {
  'greeting-flow': GreetingsFlowContent;
  'choose-lang-flow': ChooseLangeContent;
  'catalog-flow': FlowContent;
  'branch-flow': FlowContent;
  'area-and-zone-flow': FlowContent;
  'customize-order-flow': CustomizeOrderContent;
  'select-items-flow': FlowContent;
  'select-ordered-item-flow': FlowContent;
  'product-option-flow': FlowContent;
  'single-upselling-flow': SingleUpsellingContent;
  'multi-upselling-flow': FlowContent;
  'order-summary-flow': OrderSummaryContent;
};

const flowContent: {
  [K in keyof FlowContentMap]: Record<Language, FlowContentMap[K]>;
} = {
  'greeting-flow': {
    en: {
      headingText: 'Choose Service Type',
      bodyText: 'Hello, welcome to Malak Al Tawouk, how can I help you today?',
      footerText: 'Takeaway or Delivery',
      buttonText: 'Choose Service',
      menuItems: [
        {
          id: 'item_1',
          title: 'Takeaway',
          description: 'I would like to place an order for takeaway',
        },
        {
          id: 'item_2',
          title: 'Delivery',
          description: 'I would like to place an order for delivery',
        },
      ],
    },

    ar: {
      headingText: 'اختر نوع الخدمة',
      bodyText: 'مرحبًا بك في ملك الطاووق، كيف يمكنني مساعدتك اليوم؟',
      footerText: 'استلام من المطعم أو توصيل',
      buttonText: 'اختر الخدمة',
      menuItems: [
        {
          id: 'item_1',
          title: 'استلام من المطعم',
          description: 'أريد تقديم طلب للاستلام من المطعم',
        },
        {
          id: 'item_2',
          title: 'توصيل',
          description: 'أريد تقديم طلب للتوصيل',
        },
      ],
    },
  },

  'choose-lang-flow': {
    en: {
      headingText: 'Choose your language',
      bodyText: 'Please select your preferred language',
      footerText: '',
      buttonTexts: [
        { id: 'en', title: 'English' },
        { id: 'ar', title: 'العربية' },
      ],
    },
    ar: {
      headingText: 'اختر لغتك',
      bodyText: 'يرجى اختيار لغتك المفضلة',
      footerText: '',
      buttonTexts: [
        { id: 'en', title: 'الإنجليزية' },
        { id: 'ar', title: 'العربية' },
      ],
    },
  },
  'catalog-flow': {
    en: {
      headingText: 'Choose your Products',
      bodyText: 'Please select items from our menu',
      footerText: 'Browse and select items',
      buttonText: 'View Menu',
    },

    ar: {
      headingText: 'اختر منتجاتك',
      bodyText: 'يرجى اختيار الأصناف من القائمة',
      footerText: 'تصفح واختر من القائمة',
      buttonText: 'عرض القائمة',
    },
  },
  'branch-flow': {
    en: {
      headingText: 'Choose a Branch',
      bodyText: 'Please select the branch closest to you.',
      footerText: 'Browse and select a branch',
      buttonText: 'View Branches',
    },

    ar: {
      headingText: 'اختر الفرع',
      bodyText: 'يرجى اختيار الفرع الأقرب إليك',
      footerText: 'تصفح واختر الفرع',
      buttonText: 'عرض الفروع',
    },
  },
  'area-and-zone-flow': {
    en: {
      headingText: 'Select Your Area',
      bodyText: 'Please choose your area and zone for delivery.',
      footerText: 'Browse and select your location',
      buttonText: 'Enter Your Address',
    },

    ar: {
      headingText: 'اختر المنطقة',
      bodyText: 'يرجى اختيار المنطقة والنطاق الخاص بالتوصيل',
      footerText: 'تصفح واختر موقعك',
      buttonText: 'أدخل عنوانك',
    },
  },
  'customize-order-flow': {
    en: {
      headingText: 'Customize Your Order',
      bodyText: 'Would you like to customize your order?',
      footerText: 'Add or modify items in your order',
      buttonTexts: [
        { id: 'yes', title: 'Yes' },
        { id: 'no', title: 'No' },
      ],
    },

    ar: {
      headingText: 'تخصيص الطلب',
      bodyText: 'هل ترغب في تخصيص طلبك؟',
      footerText: 'يمكنك إضافة أو تعديل عناصر في طلبك',
      buttonTexts: [
        { id: 'yes', title: 'نعم' },
        { id: 'no', title: 'لا' },
      ],
    },
  },
  'select-items-flow': {
    en: {
      headingText: 'Choose items to customize',
      bodyText: 'Please select the items you want to customize',
      footerText: 'Customize items',
      buttonText: 'View Items',
    },

    ar: {
      headingText: 'اختر العناصر للتخصيص',
      bodyText: 'يرجى اختيار العناصر التي ترغب في تخصيصها',
      footerText: 'تخصيص العناصر',
      buttonText: 'عرض العناصر',
    },
  },
  'select-ordered-item-flow': {
    en: {
      headingText: 'Choose items to edit',
      bodyText: 'Please select the items you want to edit',
      footerText: 'Edit items',
      buttonText: 'View Items',
    },

    ar: {
      headingText: 'اختر العناصر للتعديل',
      bodyText: 'يرجى اختيار العناصر التي تريد تعديلها',
      footerText: 'تعديل العناصر',
      buttonText: 'عرض العناصر',
    },
  },
  'product-option-flow': {
    en: {
      headingText: 'Customize Your Item',
      bodyText: 'Please select the options or modifications for your item.',
      footerText: 'Choose from the available options',
      buttonText: 'View Options',
    },

    ar: {
      headingText: 'تخصيص المنتج',
      bodyText: 'يرجى اختيار الإضافات أو التعديلات الخاصة بالمنتج',
      footerText: 'اختر من الخيارات المتاحة',
      buttonText: 'عرض الخيارات',
    },
  },
  'single-upselling-flow': {
    en: {
      headingText: 'Add a Top-Selling Item',
      bodyText: 'Would you like to add this item to your order?',
      footerText: 'Popular add-on',
      buttonTexts: [
        { id: 'yes', title: 'Yes' },
        { id: 'no', title: 'No' },
      ],
    },

    ar: {
      headingText: 'إضافة منتج مميز',
      bodyText: 'هل ترغب في إضافة هذا المنتج إلى طلبك؟',
      footerText: 'منتج شائع',
      buttonTexts: [
        { id: 'yes', title: 'نعم' },
        { id: 'no', title: 'لا' },
      ],
    },
  },

  'multi-upselling-flow': {
    en: {
      headingText: 'Add More Items',
      bodyText: 'Would you like to add more items to your order?',
      footerText: 'Recommended for you',
      buttonText: 'View Items',
    },

    ar: {
      headingText: 'إضافة المزيد من المنتجات',
      bodyText: 'هل ترغب في إضافة المزيد من المنتجات إلى طلبك؟',
      footerText: 'موصى بها لك',
      buttonText: 'عرض المنتجات',
    },
  },
  'order-summary-flow': {
    en: {
      headingText: 'Order Summary',
      bodyText: 'Here is your order summary',
      footerText: 'Order Summary',
      buttonTexts: [
        { id: 'confirm', title: 'Confirm Order' },
        { id: 'edit', title: 'Edit' },
        { id: 'cancel', title: 'Cancel' },
      ],
    },
    ar: {
      headingText: 'ملخص الطلب',
      bodyText: 'فيما يلي ملخص طلبك',
      footerText: 'ملخص الطلب',
      buttonTexts: [
        { id: 'confirm', title: 'تأكيد الطلب' },
        { id: 'edit', title: 'تعديل' },
        { id: 'cancel', title: 'إلغاء' },
      ],
    },
  },
};

export function getFlowContent<T extends FlowType>(type: T, lang: Language): FlowContentMap[T] {
  return flowContent[type][lang];
}
