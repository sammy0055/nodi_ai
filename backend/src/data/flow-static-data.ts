type Language = 'en' | 'ar';

export type FlowType = 'greeting-flow' | 'choose-lang-flow' | 'branch-flow' | 'catalog-flow';

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

type FlowContentMap = {
  'greeting-flow': GreetingsFlowContent;
  'choose-lang-flow': ChooseLangeContent;
  'catalog-flow': FlowContent;
  'branch-flow': FlowContent;
};

const flowContent: {
  [K in keyof FlowContentMap]: Record<Language, FlowContentMap[K]>;
} = {
  'greeting-flow': {
    en: {
      headingText: 'Choose Service Type',
      bodyText: "Hello, welcome to Malek. I'm Malek Al Tawouk, how can I help you today?",
      footerText: 'Takeaway or Delivery',
      buttonText: 'Start Order',
      menuItems: [
        {
          id: 'item_1',
          title: 'Takeaway',
          description: 'I want to place an order for takeaway',
        },
        {
          id: 'item_2',
          title: 'Delivery',
          description: 'I want to place an order for delivery',
        },
        {
          id: 'item_3',
          title: 'Customer Service',
          description: 'I want to contact customer service',
        },
      ],
    },

    ar: {
      headingText: 'اختر نوع الخدمة',
      bodyText: 'مرحبًا بك في مالك. أنا مالك التاووق، كيف يمكنني مساعدتك اليوم؟',
      footerText: 'استلام من المطعم أو توصيل',
      buttonText: 'ابدأ الطلب',
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
        {
          id: 'item_3',
          title: 'خدمة العملاء',
          description: 'أريد التواصل مع خدمة العملاء',
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
        { id: 'ar', title: 'Arabic' },
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
};

export function getFlowContent<T extends FlowType>(type: T, lang: Language): FlowContentMap[T] {
  return flowContent[type][lang];
}
