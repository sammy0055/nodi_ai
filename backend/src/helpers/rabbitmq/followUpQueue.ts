import { processMessages } from '../../mcp/chat-webhook';
import { models } from '../../models';
import { ChatHistoryManager } from '../../services/ChatHistoryManager.service';
import { calculateAndSubtractCredits } from '../billing-calcuations';
import { initRabbit, RabitQueues } from './init';

import { v4 as uuidv4 } from 'uuid';

const { Conversation, WhatSappSettingsModel } = models;

export const setupFollowUPQueueProducer = async () => {
  const { channel } = await initRabbit();

  // exchange
  await channel.assertExchange('followup.exchange', 'direct', {
    durable: true,
  });

  await channel.assertQueue(RabitQueues.FOLLOW_UP_DELAY_QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'followup.exchange',
      'x-dead-letter-routing-key': 'followup',
    },
  });

  // real queue (worker queue)
  await channel.assertQueue(RabitQueues.FOLLOW_UP_QUEUE, { durable: true });
  await channel.bindQueue(RabitQueues.FOLLOW_UP_QUEUE, 'followup.exchange', 'followup');

  console.log(`${RabitQueues.DELAY_REVIEW_QUEUE} queue ready`);
};

export const scheduleFollowup = async (data: {
  conversationId: string;
  customerId: string;
  organizationId: string;
  userPhoneNumber: string;
}) => {
  const convr = await Conversation.findOne({
    where: { id: data.conversationId, organizationId: data.organizationId },
    raw: true,
  });
  const conv = convr?.get({ plain: true });
  if (conv?.followup_sent === true) {
    console.log('Skipping followup scheduling');
    return;
  }
  const { channel } = await initRabbit();
  const { classifyConversation } = new ChatHistoryManager();

  const { response, totalToken } = await classifyConversation(data.conversationId);
  console.log('==================follow up node==================');
  console.log(response?.status, conv?.followup_sent, conv);
  console.log('====================================');
  if (response?.status == 'completed') return;

  const token = uuidv4();
  // store token in DB

  if (totalToken) {
    // creditcheck
    await calculateAndSubtractCredits(
      { aiTokensUsed: totalToken || 0 },
      { organizationId: data.organizationId, conversationId: data.conversationId }
    );
    await Conversation.increment(
      { tokenCount: totalToken || 0 },
      { where: { id: data.conversationId, organizationId: data.organizationId } }
    );
  }

  // Update conversation timestamp
  await Conversation.update(
    {
      followup_token: token,
      followup_sent: true,
    },
    {
      where: { id: data.conversationId, organizationId: data.organizationId, customerId: data.customerId },
    }
  );

  const waba = await WhatSappSettingsModel.findOne({ where: { organizationId: data.organizationId } });
  if (!waba) throw new Error('no waba in followup queue producer');
  const payload = {
    conversationId: data.conversationId,
    whatsappBusinessId: waba.whatsappBusinessId,
    msg: {
      from: data.userPhoneNumber,
      text: { body: `kindly send a follow up message, based on our recent conversation` },
    },
    token,
  };

  const toMs = (mins: number) => mins * 60 * 1000;
  const delayMs = toMs(3);

  channel.sendToQueue(RabitQueues.FOLLOW_UP_DELAY_QUEUE, Buffer.from(JSON.stringify(payload)), {
    expiration: delayMs.toString(),
    persistent: true,
  });
  console.log('👍schedule successfull for follow up');
};

export const followUPQueueConsumer = async () => {
  const { channel } = await initRabbit();

  channel.consume(RabitQueues.FOLLOW_UP_QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const job = JSON.parse(msg.content.toString());

      const conversation = await Conversation.findOne({
        where: { id: job.conversationId },
      });

      // token mismatch → user replied

      if (!conversation) {
        channel.ack(msg);
        return;
      }

      if (conversation?.followup_token !== job.token) {
        channel.ack(msg);
        return;
      }

      await processMessages(job.whatsappBusinessId, job.msg);
      channel.ack(msg);
    } catch (err) {
      console.error(err);
      channel.nack(msg, false, false);
    }
  });
};
