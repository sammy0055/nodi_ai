import amqp from 'amqplib';
import { appConfig } from '../../config';

let connection: amqp.ChannelModel;
let channel: amqp.Channel;

export enum RabitQueues {
  WHATSAPP_MESSAGES = 'whatsapp.messages',
  DELAY_REVIEW_QUEUE = 'review.delay.queue',
  REVIEW_QUEUE = 'review.queue',
}

async function initRabbit() {
  if (connection && channel) return { connection, channel };
  const url = appConfig.rabbitmq;
  connection = await amqp.connect(`amqp://nodi_ai_admin:nodi_ai_passkey10@${url}`);
  channel = await connection.createChannel();

  return { connection, channel };
}

export { initRabbit };
