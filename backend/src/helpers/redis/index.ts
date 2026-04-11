import { Redis } from 'ioredis';
import { queueProducer } from '../rabbitmq';
import { WhatsAppMessage } from '../../types/whatsapp-webhook';
import { appConfig } from '../../config';
import { WorkflowDraft } from '../../workflows/malek';

const redis = new Redis(appConfig.redis);

// Handle incoming WhatsApp message and put in redis
export async function handleMessage(userId: string, payload: { msg: WhatsAppMessage; whatsappBusinessId: string }) {
  const key = `user:${userId}:messages`;
  const backupKey = `user:${userId}:messages:backup`;

  // store in both keys
  await redis.rpush(key, JSON.stringify(payload));
  await redis.rpush(backupKey, JSON.stringify(payload));

  console.log('================single message in redis====================');
  console.log(JSON.stringify(payload));
  console.log('==================single message in redis==================');
  // TTL only on main key
  await redis.expire(key, 5);
}

// Function to push combined message to RabbitMQ
async function pushToQueue(userId: string, payload: { whatsappBusinessId: string; msg: WhatsAppMessage }) {
  await queueProducer(payload);
  console.log(`Pushed to queue for user ${userId}:`, payload.whatsappBusinessId, payload.msg);
}

// Worker to listen for expired keys
export async function startExpiryListener() {
  await redis.config('SET', 'notify-keyspace-events', 'Ex');

  const sub = new Redis(appConfig.redis);
  const redisDb = 0;

  sub.psubscribe(`__keyevent@${redisDb}__:expired`);

  sub.on('pmessage', async (_, __, key) => {
    if (!key.startsWith('user:') || !key.endsWith(':messages')) return;

    const userId = key.split(':')[1];
    const backupKey = `user:${userId}:messages:backup`;

    // get stored messages from backup
    const raw = await redis.lrange(backupKey, 0, -1);
    if (!raw.length) return;

    const parsed = raw.map((r) => JSON.parse(r));

    const whatsappBusinessId = parsed[0].whatsappBusinessId;
    const msgs: WhatsAppMessage[] = parsed.map((p) => p.msg);

    console.log('================all messages in redis====================');
    console.log(msgs);
    console.log('==================all messages in redis==================');
    const combinedMsg = combineMessages(msgs);
    if (!combinedMsg) return;

    await pushToQueue(userId, {
      whatsappBusinessId,
      msg: combinedMsg,
    });

    // cleanup backup
    await redis.del(backupKey);
  });

  console.log('🏃🏼Redis expiry listener started...');
}

// combine logic
function combineMessages(msgs: WhatsAppMessage[]): WhatsAppMessage | null {
  if (!msgs.length) return null;

  const combinedText = msgs
    .filter((m) => m.text?.body)
    .map((m) => m.text!.body)
    .join(', ');

  console.log('================combinedText from redis====================');
  console.log(combinedText);
  console.log('==================combinedText from redis==================');

  const lastMessage = msgs[msgs.length - 1];

  return {
    ...lastMessage,
    text: {
      body: combinedText,
    },
  };
}

// ------------ malek message handling in redis

export async function setMessageInRedis(key: string, value: WorkflowDraft) {
  // key: user phone number
  const ttl = 20 * 60; // 20 minutes in seconds

  await redis.set(key, JSON.stringify(value), 'EX', ttl);
}

export async function getMessageFromRedis(key: string) {
  // key: user phone number
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

export async function deleteMessageFromRedis(key: string) {
  await redis.del(key);
}
