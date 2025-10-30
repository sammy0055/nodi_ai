import { ChatHistoryManager } from '../services/ChatHistoryManager.service';
import { models } from '../models';
import { MCPChatBot } from './client';
import { createSystemPrompt } from './prompts';
import { decrypt } from '../utils/crypto-utils';

const { CustomerModel, WhatSappSettingsModel, OrganizationsModel } = models;

interface SendWhatSappMessageProps {
  WhatSappBusinessPhoneNumberId?: string;
  recipientPhoneNumber: string;
  access_token?: string;
  message?: string;
}

export class ChatService extends MCPChatBot {
  protected organizationId: string = '';
  protected conversationId: string = '';
  protected userPhoneNumber: string;
  protected organizationWhatsappId: string;
  protected whatsappAccessToken: string = '';
  protected WhatSappBusinessPhoneNumberId: string = '';
  constructor(userPhoneNumber: string, organizationWhatsappId: string) {
    super();
    this.organizationWhatsappId = organizationWhatsappId;
    this.userPhoneNumber = userPhoneNumber;
  }

  static async init(userPhoneNumber: string, organizationWhatsappId: string) {
    const instance = new ChatService(userPhoneNumber, organizationWhatsappId);

    const data = await WhatSappSettingsModel.findOne({
      where: { whatsappBusinessId: instance.organizationWhatsappId },
    });

    if (!data) {
      throw new Error('organization is not registered for this phone number');
    }

    instance.organizationId = data.organizationId!;
    instance.whatsappAccessToken = decrypt(data.accessToken!);
    instance.WhatSappBusinessPhoneNumberId = data.whatsappPhoneNumberIds[0];
    return instance;
  }

  private async getOrganization() {
    const org = await OrganizationsModel.findByPk(this.organizationId);
    if (!org) {
      throw new Error('organization does not exist for this whatsapp business acount');
    }
    const planOrg = org?.get({ plain: true });
    return planOrg;
  }

  private async getCustomerData() {
    const customer = await CustomerModel.findOne({ where: { phone: this.userPhoneNumber } });
    if (!customer) {
      const data = await CustomerModel.create({
        name: '',
        phone: this.userPhoneNumber,
        organizationId: this.organizationId,
        source: 'chatbot',
      });
      return data.get({ plain: true });
    }
    return customer.get({ plain: true });
  }

  private async getAndCreateConversationIfNotExist(systemPrompt: string) {
    const chatHistory = new ChatHistoryManager();
    const customer = await this.getCustomerData();
    const conversation = await chatHistory.getConversationsByCustomerId(customer.id, this.organizationId);
    if (!conversation) {
      const conv = await chatHistory.createConversation({
        organizationId: this.organizationId,
        customerId: customer.id,
        systemPrompt: systemPrompt,
      });
      return conv?.get({ plain: true });
    }
    return conversation;
  }

  public async processQuery(userMessage: string) {
    const planOrg = await this.getOrganization();
    const customer = await this.getCustomerData();
    await this.connectToMcpServer();
    const systemPrompt = createSystemPrompt({
      organizationData: planOrg!,
      customerData: customer,
      businessTone: 'formal',
      assistantName: planOrg.AIAssistantName || 'Alex',
    });
    if (planOrg.shouldUpdateChatbotSystemPrompt) {
      await OrganizationsModel.update({ shouldUpdateChatbotSystemPrompt: false }, { where: { id: planOrg.id } });
    }
    const conversation = await this.getAndCreateConversationIfNotExist(systemPrompt);
    const res = await this.process({
      query: userMessage,
      systemPrompt: systemPrompt,
      organizationId: this.organizationId,
      conversationId: conversation.id,
      customerId: customer.id,
    });
    return res;
  }

  async sendWhatSappMessage({ recipientPhoneNumber, message }: SendWhatSappMessageProps) {
    const url = `https://graph.facebook.com/v20.0/${this.WhatSappBusinessPhoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.whatsappAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhoneNumber,
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Error ${res.status}: ${errorData.error.message}`);
    }
    // const data = await res.json();
    console.log('✅ Message sent successfully:');
  }
}

// body: JSON.stringify({
//       messaging_product: 'whatsapp',
//       to: recipientPhoneNumber,
//       type: 'template',
//       template: {
//         name: 'address_update',
//         language: { code: 'en_US' },
//         components: [
//           {
//             type: 'body',
//             parameters: [
//               {
//                 type: 'text',
//                 parameter_name: '1',
//                 text: 'first man',
//               },
//               {
//                 type: 'text',
//                 parameter_name: '2',
//                 text: 'we da here with you',
//               },
//               {
//                 type: 'text',
//                 parameter_name: '3',
//                 text: 'da nice',
//               },
//             ],
//           },
//         ],
//       },
//     }),
