import { initRabbit } from '../helpers/rabbitmq/init';

enum RabitQueues {
  TASK_QUEUE = 'Task_Queue',
  TASK = 'tasks',
  WHATSAPP_AI_BOT = 'WHATSAPP_AI_BOT_',
}
export const queueProducer = async (data: any) => {
  try {
    const { channel } = await initRabbit();
    await channel.assertQueue(RabitQueues.TASK_QUEUE, { durable: true });

    const payload = {
      type: typeof data,
      value: data,
    };

    channel.sendToQueue(RabitQueues.TASK_QUEUE, Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log('successful');
  } catch (error: any) {
    console.log('=================error===================');
    console.log(error);
    console.log('====================================');
  }
};

export const queueConsumer = async () => {
  try {
    const { channel } = await initRabbit();
    await channel.assertQueue(RabitQueues.TASK_QUEUE, { durable: true });
    channel.prefetch(1); //only process one message per worker
    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', RabitQueues.TASK_QUEUE);
    channel.consume(
      RabitQueues.TASK_QUEUE,
      async function (msg) {
        try {
          if (!msg) return;
          const raw = msg.content.toString();
          const parsed = JSON.parse(raw);
          const { value } = parsed;
          console.log(' [x] Received %s', value);
          channel.ack(msg);
          throw new Error('testing error');
        } catch (error: any) {
          console.log('=========queueConsumer-AIProcess-Error========');
          console.log(error);
          console.log('====================================');
        }
      },
      {
        noAck: false,
      }
    );
  } catch (error: any) {
    console.log('=========queueConsumer-error========');
    console.log(error);
    console.log('====================================');
  }
};
