import 'dotenv/config';
import { date } from 'zod';
import { NotificationPriority, RelatedNotificationEntity } from '../data/data-types';
import { ChatService } from '../mcp/ChatService';
import { MCPChatBot } from '../mcp/client';
import { NotificationModel } from '../models/notification.model';
import { IWhatSappSettings, WhatsappFlowLabel } from '../types/whatsapp-settings';
import { decrypt } from '../utils/crypto-utils';
import { run } from './migration';
import { sendEmail, sendVerificationEmail } from '../utils/send-email';
import { ChatHistoryManager } from '../services/ChatHistoryManager.service';
import { templates } from '../data/templates';
import { getWhatsappCatalog, priceToMetaFormat } from '../helpers/whatsapp-catalog';
import { queueProducer } from './rabbitmq';
import { getVoiceNote } from '../helpers/download_voice_note';
import { checkBusinessServiceSchedule } from '../utils/organization';
import { getEstimatedTime } from '../utils/getEstimatedTime';
import { ManageVectorStore } from '../helpers/vector-store';
import { currencyFormat } from 'simple-currency-format';
import Redis from 'ioredis';
import { OrgReviewQuestions } from '../types/organization';
import { mapToReviewQuestions } from '../utils/common-fn';

const ddd = {
  whatsappBusinessId: '1390720013053482',
  whatsappPhoneNumberIds: ['752856747922018'],
  accessToken:
    '00f833afca1c9d39d33c64623b1c4690:6eefd6dc985ef942390d8005d34c07ada2a90e9c7d88e0fa87cc8e490c98ab51645186fe562e9a14148c6ba38e2897101b5042b5f1241522a4e01ce26b84128b1cb086732656738b8a40f0e817487ca4c052073a7d167743662ea4a64a47d694ef0c7016480fb15e2f9f0c3a50f1e2736252fd503ce9d7e0dc8cd026019f903951d1a45068671137377754b2a37acf89e16f976b9e8cd6ae79b4de5d3a4815c87f9de4dcac8c419fd54cfaaba4d6caffdaaba35d25e8e025ff612a59b65a353814860b0aa23465f0966c5236ab9deba2a476473e320e8b35a285b5923637a05477515581bd71f910690a8120425968e70bcd564b6abd4727fcd050e972ce8ba2079f1cdc245b21b813ad4d1b3412a95a604c7cacd0c08a4c6d04e574e320fac8',
  organizationId: '',
};
const testMcp = async (query: string) => {
  // const client = new MCPChatBot();
  const chat = new ChatService('', '');
  const accessToken = decrypt(ddd.accessToken);
  try {
    await chat.sendWhatSappMessage({
      access_token: accessToken,
      WhatSappBusinessPhoneNumberId: ddd.whatsappPhoneNumberIds[0],
      recipientPhoneNumber: '+2348171727284',
    });
  } catch (error: any) {
    console.log('===========mcp-rrrr-error==========');
    console.log(error);
    console.log('====================================');
  }
};

const testwt = async () => {
  try {
    const accessToken = decrypt(ddd.accessToken);
    const response = await fetch(`https://graph.facebook.com/v19.0/${ddd.whatsappPhoneNumberIds[0]}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.error.message}`);
    }

    const data = await response.json();
    console.log('=================data===================');
    console.log(data);
    console.log('====================================');
  } catch (error: any) {
    console.log('===========mcp-rrrr-error==========');
    console.log(error);
    console.log('====================================');
  }
};

const notificationtest = async () => {
  try {
    // await NotificationModel.create({
    //   organizationId: '6dedf480-e915-431c-8328-3c9ca825b214',
    //   title: 'new organization signup',
    //   message: 'make enterprose just created an organization',
    //   priority: NotificationPriority.HIGH,
    //   status: 'unread',
    //   relatedEntityType: RelatedNotificationEntity.ORGANIZATION,
    //   recipientType: 'admin',
    //   readAt: new Date(),
    // });
    // await sendVerificationEmail('naenet05@gmail.com', '500443');
    console.log('successfull');
  } catch (error) {
    console.log('===========rrrr-error==========');
    console.log(error);
    console.log('====================================');
  }
};

const CATALOG_LINK = 'https://wa.me/c/+2348124220865';
const INAGE_PREVIEW =
  'https://www.shutterstock.com/shutterstock/photos/2674932797/display_1500/stock-photo-burger-with-vegetables-on-board-in-white-background-beef-burger-in-isolated-background-2674932797.jpg';
// https://wa.me/c/2348124220865
const body = {
  messaging_product: 'whatsapp',
  to: '2348171727284',
  type: 'interactive',
  interactive: {
    type: 'cta_url',
    header: {
      type: 'image',
      image: {
        link: INAGE_PREVIEW,
      },
    },
    body: {
      text: 'Check out our latest products 👇',
    },
    action: {
      name: 'cta_url',
      parameters: {
        display_text: 'view catalog',
        url: CATALOG_LINK,
      },
    },
  },
};
const ZONES = [
  {
    id: 'ca2e5b75-2758-4742-8471-5671a5c96996',
    title: 'Grilled Potato',
  },
  {
    id: 'e4110762-415d-4184-85d1-322ef2a067ac',
    title: 'Biscuit au chocolat',
  },
];
const flowbody = {
  messaging_product: 'whatsapp',
  to: '2348171727284',
  type: 'interactive',
  interactive: {
    type: 'flow',
    header: {
      type: 'text',
      text: 'Delivery Details',
    },
    body: {
      text: 'Tap below to choose your delivery zone and area.',
    },
    footer: {
      text: 'CheeseAI Bot',
    },
    action: {
      name: 'flow',
      parameters: {
        flow_id: '933470956093041',
        flow_message_version: '3',
        flow_token: 'prod-token-001',
        flow_cta: 'Open form',
        mode: 'published',
        flow_action: 'navigate',
        flow_action_payload: {
          screen: 'ADDRESS_SELECTION',
          data: JSON.stringify({ status: 'active', zones: ZONES }),
        },
      },
    },
  },
};

const bodys = {
  messaging_product: 'whatsapp',
  to: '2348171727284',
  type: 'interactive',
  interactive: {
    type: 'flow',
    header: {
      type: 'text',
      text: 'Branch Details',
    },
    body: {
      text: 'Tap below to choose branch.',
    },
    footer: {
      text: 'CheeseAI Bot',
    },
    action: {
      name: 'flow',
      parameters: {
        flow_id: '933470956093041',
        flow_message_version: '3',
        flow_cta: 'Open form',
        mode: 'published',
        flow_action: 'navigate',
        flow_action_payload: {
          screen: 'ITEMS_SELECTION',
          data: JSON.stringify({ status: 'active', items: ZONES, flowLabel: WhatsappFlowLabel.PRODUCT_ITEMS_FLOW }),
        },
      },
    },
  },
};

const actionPayload = {
  status: 'active',
  Add_Ingredient: {
    visible: true,
    required: false,
    label: 'Add Ingredients',
    description: 'Add an extra ingredient to the product. Example: add cheese, add bacon, add olive.',
    flowLabel: WhatsappFlowLabel.PRODUCT_ITEMS_FLOW,
    items: [
      {
        id: 'ec7eb050-f428-4be3-bfe2-e99e39b624fe',
        title: 'Sandwich Tawouk',
      },
      {
        id: 'ec7eb050-f428-4be3-bfe2-e99e39b624fe',
        title: 'Sandwich Tawouk',
      },
      {
        id: '1b808a7d-8ce9-4da2-9f00-9885b7498ea1',
        title: 'Caesar Salad',
      },
    ],
  },
};

const productOptionsData = [
  {
    Remove_Ingredient: {
      visible: true,
      required: false,
      label: 'Remove Ingredient',
      description: '',
      options: [
        {
          id: 'd9cadd68-6e69-41b2-97f2-0cb6ddacb3dd',
          title: 'New Choice ',
        },
        {
          id: 'c7359a0a-6c97-4214-8071-3f436e8138f5',
          title: 'Mayo ',
        },
        {
          id: '8c73a27b-1154-4897-a24b-3640a8463542',
          title: 'Pickles ',
        },
        {
          id: 'bb5035cd-3ba2-4ae7-bd57-f05982f5d816',
          title: 'Tomato ',
        },
      ],
    },
  },
  {
    Add_Ingredient: {
      visible: true,
      required: false,
      label: 'Add Ingredient',
      description: 'Add an extra ingredient to the product. Example: add cheese, add bacon, add olives.',
      options: [
        {
          id: '64c1c6f3-82b1-4c5f-8c66-86b9a36cd7b7',
          title: 'Garlic ',
        },
        {
          id: '8a5125aa-74bb-439b-a1d8-af8191a290be',
          title: 'Cheese LBP 100,000',
        },
      ],
    },
  },
  {
    Add_Side: {
      visible: true,
      required: false,
      label: 'Add Side',
      description: 'Add a side item to the order. Example: add imported fries, add coleslaw.',
      options: [
        {
          id: '55453ff6-9833-4727-8ca6-bd543c316cc0',
          title: 'Imported fries & pepsi LBP 230,000',
        },
        {
          id: '69b76caf-6b8e-4599-b5cd-1cbe7f6e1bd7',
          title: 'Imported fries &  Diet Pepsi LBP 230,000',
        },
        {
          id: 'ddc8fc23-aa29-442d-aeb0-f832ca426c21',
          title: 'Imported fries & 7up LBP 230,000',
        },
        {
          id: '664839e9-3ff2-4d7a-a61b-9568c53d0bde',
          title: 'Imported fries & Pepsi Zero LBP 230,000',
        },
        {
          id: '271c1ad6-02e9-4b32-99fc-be2a9acd4199',
          title: 'Imported fries & Diet 7up LBP 230,000',
        },
      ],
    },
  },
];

const productOptionsObject = productOptionsData.reduce((acc, item) => ({ ...acc, ...item }), {});
const productOptionFlowBody = {
  messaging_product: 'whatsapp',
  to: '2348171727284',
  type: 'interactive',
  interactive: {
    type: 'flow',
    header: {
      type: 'text',
      text: 'Product Option',
    },
    body: {
      text: 'Tap below to choose product option.',
    },
    footer: {
      text: 'open options',
    },
    action: {
      name: 'flow',
      parameters: {
        flow_id: '1598326711435435',
        flow_message_version: '3',
        flow_cta: 'Open form',
        mode: 'published',
        flow_action: 'navigate',
        flow_action_payload: {
          screen: 'PRODUCT_OPTIONS_SELECTIONS',
          data: JSON.stringify({
            status: 'active',
            ...productOptionsObject,
            productName: 'testing prodcut',
            flowLabel: WhatsappFlowLabel.PRODUCT_OPTIONS_FLOW,
          }),
        },
      },
    },
  },
};

const items = [
  {
    id: 'fb4fb99a-30e7-455d-8467-6fada91e9da2',
    label: 'Test',
    areaId: 'f3a06449-29a4-4d5e-9089-4ce475f1b077',
    zoneId: '654e3c49-5c59-4e38-9045-6f3324e97103',
    address: ' Shiss hdod9d djd9x',
    areaName: 'Abde',
    zoneName: 'Minyeh - Doniye',
  },
  {
    id: '369ef385-9d16-49e1-8f29-15b8db56daea',
    label: 'Test',
    areaId: 'b80cfbac-394b-4cfd-93a3-5de054946b56',
    zoneId: '654e3c49-5c59-4e38-9045-6f3324e97103',
    address: 'Test test 3rd floor',
    areaName: 'Bhanin',
    zoneName: 'Minyeh - Doniye',
  },
  {
    id: '1fa99df2-40d4-4fed-afc6-5d9127c348a1',
    label: 'Star',
    areaId: 'be149443-479b-4ab1-82b0-896b3c0169cf',
    zoneId: '654e3c49-5c59-4e38-9045-6f3324e97103',
    address: 'Gshwusjee eheuekke ',
    areaName: 'Nabi youchah',
    zoneName: 'Minyeh - Doniye',
  },
].map((ad) => ({ id: ad.id, title: ad.label, description: ad.address }));
const listInterate = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: '2348171727284',
  type: 'interactive',
  interactive: {
    type: 'list',
    body: {
      text: 'يرجى اختيار العنوان المفضل',
    },
    footer: {
      text: 'اختر عنوان التوصيل',
    },
    action: {
      button: 'عرض العناوين',
      sections: [
        {
          title: 'Menu',
          rows: items,
        },
      ],
    },
  },
};

const reply_btn = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: '2348171727284',
  type: 'interactive',
  interactive: {
    type: 'button',
    body: {
      text: 'Order summary (Takeaway)\nBranch: Miniyeh\n\nItems:\n• 1 x Makanek Franje (Add Ingredient: Garlic) – LBP 350,000\n\nTotals:\nSubtotal: LBP 350,000\nTakeaway: LBP 0\nTotal: LBP 350,000\n\nEstimated takeaway time: 20 minutes\n\nDo you confirm this order?',
    },
    footer: {
      text: 'Select an option',
    },
    action: {
      buttons: [
        {
          type: 'reply',
          reply: {
            id: 'confirm_order',
            title: 'Confirm',
          },
        },
        {
          type: 'reply',
          reply: {
            id: 'edit_order',
            title: 'Edit',
          },
        },
        {
          type: 'reply',
          reply: {
            id: 'cancel_order',
            title: 'cancel',
          },
        },
      ],
    },
  },
};

const questions = {
  q1_id: '802eebad-9c2c-8b68-0c1f-5e95e23e269a',
  q1_text: 'how was our service?',
  show_q1: true,
  q2_id: 'eea2d194-1646-2cc8-9fb7-492dd5c3443f',
  q2_text: 'how was our food?',
  show_q2: true,
  q3_id: '',
  q3_text: '',
  show_q3: false,
};
const reviewFlowBody = {
  messaging_product: 'whatsapp',
  to: '2348171727284',
  type: 'interactive',
  interactive: {
    type: 'flow',
    header: {
      type: 'text',
      text: 'Review',
    },
    body: {
      text: 'Tap to take review.',
    },
    footer: {
      text: 'open review',
    },
    action: {
      name: 'flow',
      parameters: {
        flow_id: '2824070427943641',
        flow_message_version: '3',
        flow_cta: 'Open form',
        mode: 'published',
        flow_action: 'navigate',
        flow_action_payload: {
          screen: 'DYNAMIC_SURVEY',
          data: JSON.stringify({
            status: 'active',
            ...questions,
            flowLabel: WhatsappFlowLabel.Review_Order,
          }),
        },
      },
    },
  },
};
const sendMessage = async () => {
  console.log('running flow send.........');

  try {
    const url = `https://graph.facebook.com/v20.0/${982830794903993}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.META_BUSINESS_SYSTEM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listInterate),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Error ${res.status}: ${errorData.error.message}`);
    }
  } catch (error: any) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
  // const data = await res.
};

const createWhsappFlow = async () => {
  const flowJson = {
    name: 'My first flow In React Ja',
    categories: ['OTHER'],
    flow_json: JSON.stringify(templates.whatsappFlow.zoneAndAreaFlow),
    publish: true,
    endpoint_uri: 'https://labanon.naetechween.com/api/whatsappflow/flow-endpoint',
  };
  try {
    const url = `https://graph.facebook.com/v20.0/${589647264175107}/flows`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.META_BUSINESS_SYSTEM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flowJson),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Error ${res.status}: ${errorData.error.message}`);
    }
  } catch (error: any) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
};

const summarize = async () => {
  const { summarizeConversationById, insertConverationItem } = new ChatHistoryManager();
  const summary = await summarizeConversationById('conv_69682dbcaca48194884ad3027d0b5e8b00c794c6540cfab1');
  console.log(summary);
};

const p = {
  itemId: '734c51c4-8e3e-47b3-91e4-62c7fdbda671',
  name: 'jelof rice',
  description: 'hot jelof rice for the christma season',
  price: 100,
  currency: 'USD',
  imageUrl:
    'https://amfqqtpfqniuzvzdowzq.supabase.co/storage/v1/object/public/nodi_product_images/1a9328d8-3aec-4706-b09f-1dc1685538b7.png',
};

const catalogMag = async (product: Partial<any>) => {
  const url = `https://graph.facebook.com/v23.0/1513654516497165/items_batch`;
  const headers = { Authorization: `Bearer ${process.env.META_BUSINESS_SYSTEM_TOKEN}` };

  const { itemId, name, description, price, currency = 'USD', imageUrl } = p;
  const payload = {
    item_type: 'PRODUCT_ITEM',
    requests: JSON.stringify([
      {
        method: 'UPDATE',
        data: {
          id: itemId,
          title: name,
          description,
          price: priceToMetaFormat(price, currency),
          image_link: imageUrl || 'https://example.com/placeholder.png',
          link: 'https://cot.credobyte.ai/',
          availability: 'in stock',
          condition: 'new',
        },
      },
    ]),
  };

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      throw new Error(errorMessage);
    }
  }

  return await response.json();
};

const listCatalogItems = async () => {
  try {
    const params = 'fields=id,retailer_id,name,price,availability,description,images&limit=100';
    let url = `https://graph.facebook.com/v23.0/${'1386344629753105'}/products?${params}`;
    const data = await getWhatsappCatalog(url);

    console.log('====================================');
    console.log(data);
    console.log('====================================');
  } catch (error: any) {
    console.log('===================error=================');
    console.log(error);
    console.log('====================================');
  }
};

const createCatalogItem = async () => {
  try {
    const res = await catalogMag(p);
    console.log('==================res==================');
    console.log(res);
    console.log('====================================');
  } catch (error: any) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
};

const mockServiceScheduleData = [
  {
    dayOfWeek: 'monday',
    hours: [{ open: '08:00', close: '09:00' }],
  },
  {
    dayOfWeek: 'tuesday',
    hours: [{ open: '09:00', close: '17:00' }],
  },
  {
    dayOfWeek: 'wednesday',
    hours: [{ open: '09:00', close: '18:00' }],
  },
  {
    dayOfWeek: 'thursday',
    hours: [{ open: '10:00', close: '19:00' }],
  },
  {
    dayOfWeek: 'friday',
    hours: [{ open: '09:00', close: '21:00' }],
  },
  {
    dayOfWeek: 'saturday',
    hours: [],
  },
  {
    dayOfWeek: 'sunday',
    hours: [{ open: '12:00', close: '20:00' }],
  },
];

const sendEmails = async () => {
  try {
    await sendEmail({ to: 'naenet05@gmail.com', subject: 'testing email', text: 'email works perfectly' });
  } catch (error) {
    console.log('==================error==================');
    console.log(error);
    console.log('====================================');
  }
};

const getConversationHistory = async () => {
  try {
    const { summarizeConversationById } = new ChatHistoryManager();
    await summarizeConversationById('conv_69b8ed6215408197876ebeb2eddf34db0812da941fab882d');
  } catch (error: any) {
    console.log('===================error=================');
    console.log(error);
    console.log('====================================');
  }
};

function formatCatalogMessage(items: any[]): any {
  const products = items.flatMap((i) =>
    Array.from({ length: i.quantity }, () => ({
      id: i.product_retailer_id,
      quantity: 1,
    }))
  );

  const stringifiedProducts = JSON.stringify(products);

  const prompt = `here is a an array of products ids and quantity i have selected, retrieve this products and complete the order process.\n product_ids:${stringifiedProducts}`;

  return prompt;
}
// console.log('====================================');
// console.log(formatCatalogMessage([
//   { "product_retailer_id": "A", "quantity": 2 },
//   { "product_retailer_id": "B", "quantity": 1 }
// ]));
// console.log('====================================');
// sendMessage();
// getConversationHistory();
// console.log('====================================');
// console.log(getEstimatedTime("1970-01-01 03:00:00+00" as any));
// console.log('====================================');
// sendEmails()
// const slots = checkBusinessServiceSchedule(mockServiceScheduleData)
// console.log('====================================');
// console.log(slots);
// console.log('====================================');
// summarize();
// testMcp('hello');
// run();
// createWhsappFlow();
// sendMessage()
// createCatalogItem();
// queueProducer({ data: { hel: { d: '', dfsaf: ['dwee'] } } });
// listCatalogItems();
// getVoiceNote('1500555364366195');

// const ttttt = async () => {
//   try {
//     const vectorStore = new ManageVectorStore();
//    const result = await vectorStore.searchProducts({
//       query: 'Sandwich Tawouk',
//       organizationId: '73f2cd06-127c-4d08-b584-ed4eae2cd15e',
//     });
//     console.log('=================result===================');
//     console.log(result);
//     console.log('====================================');
//   } catch (error) {
//     console.log('===================error=================');
//     console.log(error);
//     console.log('====================================');
//   }
// };

// for testing -------------------
const getRedisMessage = async (key: string) => {
  const redis = new Redis('redis://104.219.250.180:4015');
  redis.on('error', (err) => {
    console.log('Redis error:', err.message);
  });
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

const removeRedisMessage = async (key: string) => {
  const redis = new Redis('redis://104.219.250.180:4015');
  redis.on('error', (err) => {
    console.log('Redis error:', err.message);
  });
  await redis.del(key);
};

// ttttt()
// console.log('====================================');
// console.log(await removeRedisMessage('2348171727284'));
// // console.log("+234 81 7172 7284".trim().replace('+', '') .replace(/\s+/g, ''));

// console.log('====================================');

// 2 questions
// const test2: OrgReviewQuestions[] = [
//   {
//     id: 'food_quality',
//     question: 'How was the food?',
//     answer: null,
//   },
// ];

// console.log('====================================');
// console.log(mapToReviewQuestions(test2));
// console.log('====================================');
