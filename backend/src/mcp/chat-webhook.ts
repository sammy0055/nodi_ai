import express from 'express';
import NodeCache from 'node-cache';
import { ChatService } from './ChatService';
import { WhatsAppMessage, WhatsAppWebhookPayload } from '../types/whatsapp-webhook';
export const chatRoute = express.Router();

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
        console.log('Got message:', msg.id, msg.text?.body);
        // process each message independently
        await handleMessages(entry.id, msg);
      }
    }
  }

  async function handleMessages(whatsappBusinessId: string, msg: WhatsAppMessage) {
    const userPhoneNumber = msg.from;
    const userMessage = msg.text?.body || '';

    try {
      const chat = await ChatService.init(userPhoneNumber, whatsappBusinessId);
      const response = await chat.processQuery(userMessage);
      return await chat.sendWhatSappMessage({ recipientPhoneNumber: userPhoneNumber, message: response });
    } catch (error: any) {
      console.log('webhook-chat-error', error);
      // return res.status(500).json({ error: error.message });
    }
  }
});
