import { processMessages } from '../../../mcp/chat-webhook';
import { models } from '../../../models';
import { initRabbit, RabitQueues } from '../init';

const { WhatSappSettingsModel, OrderModel } = models;

export const setupReviewQueues = async () => {
  const { channel } = await initRabbit();

  // exchange
  await channel.assertExchange('review.exchange', 'direct', {
    durable: true,
  });

  await channel.assertQueue(RabitQueues.DELAY_REVIEW_QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'review.exchange',
      'x-dead-letter-routing-key': 'review',
    },
  });

  // real queue (worker queue)
  await channel.assertQueue(RabitQueues.REVIEW_QUEUE, {
    durable: true,
  });

  await channel.bindQueue(RabitQueues.REVIEW_QUEUE, 'review.exchange', 'review');

  console.log('Review queues ready');
};

export async function scheduleReview(data: { orderId: string }) {

  const { channel } = await initRabbit();
  const toMs = (mins: number) => mins * 60 * 1000;

  const order = (await OrderModel.findByPk(data.orderId, {
    include: ['customer', 'organization'],
  })) as any;

  const delayMs = toMs(order.organization.reviewTimer || 5);

  if (!order) throw new Error("order does not exist, can't add to reviewQeue");

  if (!order?.customer.phone) throw new Error('customer data is messy');
  const orgSettings = await WhatSappSettingsModel.findOne({ where: { organizationId: order?.organizationId } });
  if (!orgSettings) throw new Error('no whatsapp settings for this organization');

  const payload = {
    type: typeof data,
    value: {
      ...data,
      msg: {
        from: order?.customer.phone,
        text: { body: `kindly ask the customer for review for this order with id ${order?.id}` },
      },
      whatsappBusinessId: orgSettings.whatsappBusinessId,
    },
  };

  channel.sendToQueue(RabitQueues.DELAY_REVIEW_QUEUE, Buffer.from(JSON.stringify(payload)), {
    expiration: delayMs.toString(),
    persistent: true,
  });
}

export const startReviewtWorkerConsumer = async () => {
  const { channel } = await initRabbit();

  channel.consume(RabitQueues.REVIEW_QUEUE, async (message: any) => {
    if (!message) return;

    try {
      const { value } = JSON.parse(message.content.toString());
      const { orderId, whatsappBusinessId, msg } = value;

      const order = await OrderModel.findByPk(orderId, {
        include: ['customer'],
      });

      if (order && order.isReviewed) {
        channel.ack(msg);
        return;
      }

      await processMessages(whatsappBusinessId, msg);
      channel.ack(message);
    } catch (err) {
      channel.nack(message, false, true);
    }
  });

  console.log(` [*] Review worker running, Waiting for messages in ${RabitQueues.REVIEW_QUEUE}`);
};
