import { processMessages } from '../../mcp/chat-webhook';
import { models } from '../../models';
import { ChatHistoryManager } from '../../services/ChatHistoryManager.service';
import { calculateAndSubtractCredits } from '../billing-calcuations';
import { initRabbit, RabitQueues } from './init';

import { v4 as uuidv4 } from 'uuid';

const { Conversation, WhatSappSettingsModel } = models;

export const followUPQueueProducer = async () => {
  const { channel } = await initRabbit();

  // exchange
  await channel.assertExchange('followup.exchange', 'x-delayed-message', {
    durable: true,
    arguments: {
      'x-delayed-type': 'direct',
    },
  });

  await channel.assertQueue(RabitQueues.FOLLOW_UP_QUEUE, { durable: true });
  await channel.bindQueue(RabitQueues.FOLLOW_UP_QUEUE, 'followup.exchange', 'followup');

  return channel;
};

export const followUPQueueConsumer = async () => {
  const channel = await followUPQueueProducer();

  channel.consume(RabitQueues.FOLLOW_UP_QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const job = JSON.parse(msg.content.toString());

      const conversation = await Conversation.findOne({
        where: { id: job.conversationId },
      });

      // token mismatch → user replied
      if (!conversation || conversation.followup_token !== job.token) {
        channel.ack(msg);
        return;
      }

      await processMessages(job.whatsappBusinessId, job.msg);
      channel.ack(msg);
    } catch (err) {
      console.error(err);
      channel.nack(msg);
    }
  });
};

export const scheduleFollowup = async (data: {
  conversationId: string;
  customerId: string;
  organizationId: string;
  userPhoneNumber: string;
}) => {

  const { classifyConversation } = new ChatHistoryManager();
  const { response, totalToken } = await classifyConversation(data.conversationId);
  if (response?.status === 'COMPLETED') return;
  const token = uuidv4();
  // store token in DB

  if (totalToken) {
    // creditcheck
    await calculateAndSubtractCredits(
      { aiTokensUsed: totalToken || 0 },
      { organizationId: data.organizationId, conversationId: data.conversationId }
    );
    await Conversation.increment({ tokenCount: totalToken || 0 }, { where: { id: data.conversationId } });
  }

  // Update conversation timestamp
  await Conversation.update(
    {
      followup_token: token,
    //   userRespondedToFollowup: false,
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

  const channel = await followUPQueueProducer();
  channel.publish('followup_exchange', 'followup', Buffer.from(JSON.stringify(payload)), {
    persistent: true,
    headers: {
      'x-delay': 5 * 60 * 1000, // 30 mins
    },
  });
};
