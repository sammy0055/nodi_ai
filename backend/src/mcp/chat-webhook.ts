import express from 'express';
import NodeCache from 'node-cache';
import { ChatService } from './ChatService';
import { ProductItem, WhatsAppMessage, WhatsAppWebhookPayload } from '../types/whatsapp-webhook';
import { ZoneModel } from '../models/zones.model';
import { AreaModel } from '../models/area.model';
export const chatRoute = express.Router();

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

// store active user queues
const userQueues = new Map();

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
        } else {
          console.log('Got message:', msg.id, msg.text?.body);
          // process each message independently
          // await handleMessages(entry.id, msg);
          await handleIncomingMessage({ whatsappBusinessId: entry.id, msg: msg, processMessages });
        }
      }
    }
  }

  async function handleMessages(whatsappBusinessId: string, msg: WhatsAppMessage) {
    const userPhoneNumber = msg.from;
    const userMessage = msg.text?.body || '';

    try {
      const chat = await ChatService.init(userPhoneNumber, whatsappBusinessId);
      const res = await chat.processQuery(userMessage);
      const response = res.data;
      switch (response.type) {
        case 'message':
          await chat.sendWhatSappMessage({ recipientPhoneNumber: userPhoneNumber, message: response.response });
          break;
        case 'catalog':
          await chat.sendWhatSappCatalogInteractiveMessage({
            recipientPhoneNumber: userPhoneNumber,
            catalogUrl: response.catalogUrl,
            productUrl: response.productUrl,
            bodyText: response.bodyText,
            buttonText: response.buttonText,
          });
          break;
        case 'flow':
          await chat.sendWhatSappFlowInteractiveMessage({
            recipientPhoneNumber: userPhoneNumber,
            zones: response.zones,
            flowId: response.flowId,
            flowName: response.flowName,
            headingText: response.headingText,
            bodyText: response.bodyText,
            footerText: response.footerText,
          });
          break;
        default:
          console.error('admin: wrong message type from chatbot');
          break;
      }
    } catch (error: any) {
      console.log('webhook-chat-error', error);
      // return res.status(500).json({ error: error.message });
    }
  }

  async function handleIncomingMessage({ whatsappBusinessId, msg, processMessages }: IncomingMessageAttr) {
    const userPhoneNumber = msg.from;
    const userMessage = msg.text?.body || '';

    if (!userQueues.has(userPhoneNumber)) {
      userQueues.set(userPhoneNumber, { messages: [], processing: false });
    }

    const queue = userQueues.get(userPhoneNumber);
    queue.messages.push(userMessage);

    // if already processing, just queue and exit
    if (queue.processing) return;

    queue.processing = true;

    // wait a bit to collect more messages (2s window)
    await new Promise((r) => setTimeout(r, 2000));

    while (queue.messages.length > 0) {
      // collect all messages (handles spam bursts)
      const batch = [...queue.messages].join('\n');
      queue.messages.length = 0; // clear buffer
      if (msg.text?.body) msg.text.body = batch;
      try {
        await processMessages(whatsappBusinessId, msg);
      } catch (err) {
        console.error('Error processing user messages:', err);
      }
    }

    // cleanup to free memory
    queue.processing = false;
    userQueues.delete(userPhoneNumber);
  }

  async function processMessages(whatsappBusinessId: string, msg: WhatsAppMessage) {
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
});
