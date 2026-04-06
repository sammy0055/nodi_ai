import express from 'express';
import NodeCache from 'node-cache';
import { ChatService } from './ChatService';
import { ProductItem, WhatsAppMessage, WhatsAppWebhookPayload } from '../types/whatsapp-webhook';
import { ZoneModel } from '../models/zones.model';
import { AreaModel } from '../models/area.model';
import { queueProducer } from '../helpers/rabbitmq';
import { getVoiceNote } from '../helpers/download_voice_note';
import { NotificationModel } from '../models/notification.model';
import { NotificationPriority, RelatedNotificationEntity } from '../data/data-types';
import { WhatsappFlowLabel } from '../types/whatsapp-settings';
import { models } from '../models';
import { productOptionsTaxonomy } from '../data/taxonomy';
import { ProductModel } from '../models/products.model';
import { handleMessage } from '../helpers/redis';
export const chatRoute = express.Router();

const { BranchesModel, ProductOptionChoiceModel, ProductOptionModel } = models;
export interface IncomingMessageAttr {
  whatsappBusinessId: string;
  msg: WhatsAppMessage;
  processMessages: (whatsappBusinessId: string, msg: WhatsAppMessage) => Promise<void>;
}

const messageCache = new NodeCache({ stdTTL: 3600 }); // 1h TTL
function isDuplicate(id: string) {
  if (messageCache.has(id)) return true;
  messageCache.set(id, true);
  return false;
}

chatRoute.get('/chat-webhook', async (req, res) => {
  console.log('====================================');
  console.log('webhook received a request', req?.body);
  console.log('====================================');
  try {
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const token = req.query['hub.verify_token'];
    const VERIFY_TOKEN = 'sammy_credobyte';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log(`Webhook verified: ${challenge}`);
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  } catch (error: any) {
    console.error(error);
  }
});

chatRoute.post('/chat-webhook', async (req, res) => {
  const payload = req.body as WhatsAppWebhookPayload;
  res.sendStatus(200);
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      for (const msg of change.value?.messages || []) {
        if (isDuplicate(msg.id)) {
          continue;
        }
        console.log('=====================msg===============');
        console.log(JSON.stringify(msg));
        console.log('====================================');
        if (msg.type === 'order') {
          const orderMessage = formatCatalogMessage(msg.order?.product_items!);
          const newMsg = {
            ...msg,
            text: {
              body: orderMessage,
            },
          };

          console.log('Got message:', msg.id, newMsg.text?.body);
          await handleIncomingMessage({ whatsappBusinessId: entry.id, msg: newMsg, processMessages });
        } else if (msg.type === 'interactive') {
          const payload = JSON.parse(msg.interactive?.nfm_reply.response_json as any);

          if (payload?.zone_id || payload?.area_id) {
            const selectedZone = await ZoneModel.findByPk(payload?.zone_id);
            const selectedArea = await AreaModel.findByPk(payload?.area_id);
            const shippingAddress = payload?.note;

            const newMsg = {
              ...msg,
              text: {
                body: JSON.stringify({
                  selectedZone: selectedZone,
                  selectedArea: selectedArea,
                  shippingAddress: shippingAddress,
                }),
              },
            };

            console.log('Got message:', msg.id, newMsg.text?.body);
            await handleIncomingMessage({ whatsappBusinessId: entry.id, msg: newMsg, processMessages });
          } else if (payload?.branch_id) {
            const selectedBranch = await BranchesModel.findByPk(payload?.branch_id);

            const newMsg = {
              ...msg,
              text: {
                body: JSON.stringify({
                  selectedBranch: selectedBranch,
                }),
              },
            };

            console.log('Got message:', msg.id, newMsg.text?.body);
            await handleIncomingMessage({ whatsappBusinessId: entry.id, msg: newMsg, processMessages });
          } else if (payload.flowLabel === WhatsappFlowLabel.PRODUCT_OPTIONS_FLOW) {
            const optionNames = productOptionsTaxonomy.restaurant.map((i) => i.name);
            const flatIds = Object.keys(payload)
              .filter((key) => optionNames.includes(key))
              .flatMap((key) => (Array.isArray(payload[key]) ? payload[key] : [payload[key]]));

            console.log('==============product option choices ids ===============');
            console.log(flatIds);
            console.log('==============product option choices ids ===============');
            const selectedProductOptions = await ProductOptionChoiceModel.findAll({
              where: { id: flatIds },
              include: [
                {
                  model: ProductOptionModel,
                  as: 'productOption',
                  attributes: ['id', 'name', 'description', 'isRequired', 'productId'],
                },
              ],
            });
            console.log('====================selectedProductOptions================');
            console.log(selectedProductOptions);
            console.log('====================================');
            const newMsg = {
              ...msg,
              text: {
                body: JSON.stringify({
                  selectedProductOptions: selectedProductOptions,
                }),
              },
            };

            console.log('Got message:', msg.id, newMsg.text?.body);
            await handleIncomingMessage({ whatsappBusinessId: entry.id, msg: newMsg, processMessages });
          } else if (payload.flowLabel === WhatsappFlowLabel.PRODUCT_ITEMS_FLOW) {
            const selectedProductIds = payload.item_id;
            const products = await ProductModel.findAll({
              where: { id: selectedProductIds },
              attributes: ['id', 'name'],
            });

            const newMsg = {
              ...msg,
              text: {
                body: JSON.stringify({
                  selectedProducts: products,
                }),
              },
            };

            console.log('Got message:', msg.id, newMsg.text?.body);
            await handleIncomingMessage({ whatsappBusinessId: entry.id, msg: newMsg, processMessages });
          } else {
            console.log('Got message:', msg.id, msg);
            await handleIncomingMessage({ whatsappBusinessId: entry.id, msg, processMessages });
          }
        } else if (msg.type === 'audio') {
          const text = await getVoiceNote(msg.audio?.id!);
          const newMsg = {
            ...msg,
            text: {
              body: text,
            },
          };
          console.log('Got message:', msg.id, msg);
          await handleIncomingMessage({ whatsappBusinessId: entry.id, msg: newMsg, processMessages });
        } else {
          console.log('Got message:', msg.id, msg.text?.body);
          // process each message independently
          // await handleMessages(entry.id, msg);
          await handleIncomingMessage({ whatsappBusinessId: entry.id, msg: msg, processMessages });
        }
      }
    }
  }
});

async function handleMessages(whatsappBusinessId: string, msg: WhatsAppMessage) {
  const userPhoneNumber = msg.from;
  const userMessage = msg.text?.body || '';
  const userRespondedToFollowUp = msg?.userRespondedToFollowUp;

  try {
    const chat = await ChatService.init(userPhoneNumber, whatsappBusinessId);
    const res = await chat.processQuery(userMessage, { userRespondedToFollowUp: userRespondedToFollowUp });
    const response = res.data;
    console.log('==================response==================');
    console.log(response);
    console.log('====================================');
    switch (response.type) {
      case 'message':
        await chat.sendWhatSappMessage({ recipientPhoneNumber: userPhoneNumber, message: response.response });
        break;
      case 'catalog':
        await chat.sendWhatSappCatalogInteractiveMessage({
          recipientPhoneNumber: userPhoneNumber,
          catalogUrl: response.catalogUrl.replace('+', ''),
          productUrl: response.productUrl,
          bodyText: response.bodyText,
          buttonText: response.buttonText,
        });
        break;
      case 'area-and-zone-flow':
        await chat.sendWhatSappFlowInteractiveMessage({
          recipientPhoneNumber: userPhoneNumber,
          zones: response?.zones,
          flowId: response?.flowId,
          flowName: response?.flowName,
          headingText: response?.headingText,
          bodyText: response?.bodyText,
          buttonText: response.buttonText,
          footerText: response?.footerText,
        });
        break;
      case 'branch-flow':
        await chat.sendWhatSappBranchFlowInteractiveMessage({
          recipientPhoneNumber: userPhoneNumber,
          branches: response?.branches,
          flowId: response?.flowId,
          flowName: response?.flowName,
          headingText: response?.headingText,
          bodyText: response?.bodyText,
          buttonText: response.buttonText,
          footerText: response?.footerText,
        });
        break;
      case 'product-options-flow':
        const productOptions = response.productOptions.reduce((acc: any, item: any) => {
          acc[item.key] = {
            visible: item.visible || true,
            required: item.required || false,
            label: item.label,
            description: item.description || '',
            options: item.options,
          };

          return acc;
        }, {});

        await chat.sendWhatSappProductOptionFlowInteractiveMessage({
          recipientPhoneNumber: userPhoneNumber,
          productName: response.productName,
          productOptions: productOptions,
          flowId: response?.flowId,
          flowName: response?.flowName,
          headingText: response?.headingText,
          bodyText: response?.bodyText,
          buttonText: response.buttonText,
          footerText: response?.footerText,
        });
        break;
      case 'product-items-flow':
        await chat.sendWhatSappOrderedItemsFlowInteractiveMessage({
          recipientPhoneNumber: userPhoneNumber,
          items: response.items,
          flowId: response?.flowId,
          flowName: response?.flowName,
          headingText: response?.headingText,
          bodyText: response?.bodyText,
          buttonText: response.buttonText,
          footerText: response?.footerText,
        });
        break;
      default:
        console.error('admin: wrong message type from chatbot');
        break;
    }
  } catch (error: any) {
    console.log('webhook-chat-error', error);
    await NotificationModel.create({
      relatedEntityType: RelatedNotificationEntity.SYSTEM,
      title: `'chat-service-error', user-phone:${userPhoneNumber}`,
      message: error.message,
      status: 'unread',
      priority: NotificationPriority.HIGH,
      recipientType: 'admin',
    });
    // return res.status(500).json({ error: error.message });
  }
}

async function handleIncomingMessage({ whatsappBusinessId, msg, processMessages }: IncomingMessageAttr) {
  try {
    //  await queueProducer({ whatsappBusinessId, msg });

    await handleMessage(msg.from, { whatsappBusinessId, msg });
  } catch (err) {
    console.error('Error processing user messages:', err);
  }
}

export async function processMessages(whatsappBusinessId: string, msg: WhatsAppMessage) {
  const userPhoneNumber = msg.from;
  console.log(`Processing for ${userPhoneNumber}:`, msg.text?.body);

  // your chatbot logic here
  await handleMessages(whatsappBusinessId, msg);
}

function formatCatalogMessage(items: ProductItem[]): string {
  const products = items.map((i) => ({ id: i.product_retailer_id, quantity: i.quantity }));
  const stringifiedProducts = JSON.stringify(products);
  const prompt = `here is a an array of products ids and quantity a customer has selected, retrieve this products and complete the order process.\n product_ids:${stringifiedProducts}`;
  return prompt;
}
