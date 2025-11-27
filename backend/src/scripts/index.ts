import 'dotenv/config';
import { date } from 'zod';
import { NotificationPriority, RelatedNotificationEntity } from '../data/data-types';
import { ChatService } from '../mcp/ChatService';
import { MCPChatBot } from '../mcp/client';
import { NotificationModel } from '../models/notification.model';
import { IWhatSappSettings } from '../types/whatsapp-settings';
import { decrypt } from '../utils/crypto-utils';
import { run } from './migration';
import { sendVerificationEmail } from '../utils/send-email';
import { ChatHistoryManager } from '../services/ChatHistoryManager.service';
import { templates } from '../data/templates';
import { priceToMetaFormat } from '../helpers/whatsapp-catalog';

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
const CATALOG_LINK = 'https://wa.me/c/+234 812 422 0865';
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
  { id: 'zone_1', title: 'Zone 1' },
  { id: 'zone_2', title: 'Zone 2' },
  { id: 'zone_3', title: 'Zone 3' },
  { id: 'zone_4', title: 'Zone 4' },
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
        flow_id: '906997378318320',
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
        flow_id: '2306750766466909',
        flow_message_version: '3',
        flow_cta: 'Open form',
        mode: 'published',
        flow_action: 'navigate',
        flow_action_payload: {
          screen: 'BRANCH_SELECTION',
          data: JSON.stringify({ status: 'active', branches: ZONES }),
        },
      },
    },
  },
};

const sendMessage = async () => {
  try {
    const url = `https://graph.facebook.com/v20.0/${860816193789515}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.META_BUSINESS_SYSTEM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodys),
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
  const { summarizeConversationById } = new ChatHistoryManager();
  const summary = await summarizeConversationById('conv_6926ce4f0d5c8197ae42ec29689de984036cc7ca7044cece');
  console.log(summary);
};

const p = {
  itemId: '44rr4455tt',
  name: 'piza',
  description: 'best piza in the world',
  imageUrl:
    'https://media.istockphoto.com/id/2226435721/photo/using-phone-for-mobile-banking.jpg?s=1024x1024&w=is&k=20&c=0J5rVLquYvHtQfswHOPcAfAVNV-VqufT0DkVAm89lts=',
};

const catalogMag = async (
  { itemId, name, description, price, currency = 'USD', imageUrl }: Partial<any>,
  whatsappSettings: IWhatSappSettings
) => {
  try {
    const url = `https://graph.facebook.com/v23.0/${whatsappSettings.catalogId}/items_batch`;
    const headers = { Authorization: `Bearer ${process.env.META_BUSINESS_SYSTEM_TOKEN}` };

    const payload = {
      item_type: 'PRODUCT_ITEM',
      requests: JSON.stringify([
        {
          method: 'CREATE',
          data: {
            id: `item_${itemId}`,
            title: name,
            description,
            price: priceToMetaFormat(price, currency),
            image_link: imageUrl,
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
  } catch (error: any) {}
};

// summarize();
// testMcp('hello');
// run();
// createWhsappFlow();
// sendMessage()
