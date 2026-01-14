import { processMessages } from '../../mcp/chat-webhook';
import { initRabbit, RabitQueues } from './init';

export const queueProducer = async (data: any) => {
  try {
    const { channel } = await initRabbit();
    await channel.assertQueue(RabitQueues.WHATSAPP_MESSAGES, { durable: true });

    const payload = {
      type: typeof data,
      value: data,
    };

    channel.sendToQueue(RabitQueues.WHATSAPP_MESSAGES, Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log(`added message to ${RabitQueues.WHATSAPP_MESSAGES} queue successfully`);
  } catch (error: any) {
    console.log('=================queueProducer-Error===================');
    console.log(error.message);
    console.log('====================================');
  }
};

export const queueConsumer = async () => {
  try {
    const { channel } = await initRabbit();
    await channel.assertQueue(RabitQueues.WHATSAPP_MESSAGES, { durable: true });
    channel.prefetch(30); //only process one message per worker
    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', RabitQueues.WHATSAPP_MESSAGES);
    channel.consume(
      RabitQueues.WHATSAPP_MESSAGES,
      async function (message) {
        if (!message) return;
        try {
          const { value } = JSON.parse(message.content.toString());
          const { whatsappBusinessId, msg } = value;

          console.log('[x] Received:', value);

          await processMessages(whatsappBusinessId, msg);
          channel.ack(message);
        } catch (error: any) {
          console.log('=========queueConsumer-AIProcess-Error========');
          console.log(error.message);
          console.log('====================================');

          // nack the message so RabbitMQ can handle retry / DLQ
          channel.nack(message, false, false);
        }
      },
      {
        noAck: false,
      }
    );
  } catch (err: any) {
    console.log('=========queueConsumer-error========');
    console.log('Queue consumer initialization failed:', err.message);
    console.log('====================================');
  }
};
