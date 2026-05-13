import { models } from '../../models';
import { formatAmount } from '../../workflows/utils';
import { initRabbit, RabitQueues } from './init';

const { OrderModel, CustomerModel, OrganizationsModel } = models;

export const setupPendingOrderQueueReminder = async () => {
  const { channel } = await initRabbit();

  // exchange
  await channel.assertExchange('pending-order.exchange', 'direct', {
    durable: true,
  });

  await channel.assertQueue(RabitQueues.PENDING_ORDER_DELAY_QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'pending-order.exchange',
      'x-dead-letter-routing-key': 'pending-order',
    },
  });

  // real queue (worker queue)
  await channel.assertQueue(RabitQueues.PENDING_ORDER_QUEUE, { durable: true });
  await channel.bindQueue(RabitQueues.PENDING_ORDER_QUEUE, 'pending-order.exchange', 'pending-order');

  console.log(`${RabitQueues.PENDING_ORDER_DELAY_QUEUE} queue ready`);
};

interface PendingOrderQueuePayload {
  orderId: string;
  organizationId: string;
}

export const pendingOrderQueueProducer = async (payload: PendingOrderQueuePayload) => {
  const toMs = (mins: number) => mins * 60 * 1000;
  const delayMs = toMs(5);

  const { channel } = await initRabbit();
  channel.sendToQueue(RabitQueues.PENDING_ORDER_DELAY_QUEUE, Buffer.from(JSON.stringify(payload)), {
    expiration: delayMs.toString(),
    persistent: true,
  });
  console.log('👍pending order successfull scheduled for follow up');
};

export const pendingOrderQueueConsumer = async () => {
  const { channel } = await initRabbit();

  channel.consume(RabitQueues.PENDING_ORDER_QUEUE, async (msg) => {
    if (!msg) return;
    try {
      const job = JSON.parse(msg.content.toString()) as PendingOrderQueuePayload;
      const order = await OrderModel.findOne({ where: { id: job.orderId, organizationId: job.organizationId } });
      if (!order) {
        channel.ack(msg);
        throw new Error('fake order in pending order schedule queue');
      }
      const customer = await CustomerModel.findByPk(order.customerId);
      const org = await OrganizationsModel.findByPk(job.organizationId);
      const format = formatAmount('en', order.currency);
      const text = `Hello, you have an order from ${customer?.name ?? ''} in the portal that needs your attention. Order Total: ${format(order.totalAmount)}`;
      if (org?.contactPhoneNumbers?.length === 0) throw new Error('No contact phone number for this organization');
      await sendMessage(org!.contactPhoneNumbers!, text);
      channel.ack(msg);
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  });
};

const sendMessage = async (recipientPhoneNumbers: string[], message: string) => {
  console.log('running send pending order reminder.........');

  try {
    const url = `https://graph.facebook.com/v20.0/721528764372914/messages`;

    for (const phoneNumber of recipientPhoneNumbers) {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.META_BUSINESS_SYSTEM_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber.trim(),
          type: 'template',
          template: {
            name: 'order_reminder',
            language: {
              code: 'en',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    parameter_name: 'order_details',
                    text: message,
                  },
                ],
              },
            ],
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        console.log(`Failed for ${phoneNumber}`, errorData);

        continue;
      }

      console.log(`✅ Message sent to ${phoneNumber}`);
    }
  } catch (error: any) {
    console.log(error);
  }
};
