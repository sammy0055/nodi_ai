import { ChatHistoryManager } from '../services/ChatHistoryManager.service';
import { models } from '../models';
import { MCPChatBot } from './client';
import { createSystemPrompt, createValidationSystemPrompt } from './prompts';
import { decrypt } from '../utils/crypto-utils';
import { Conversation } from '../models/conversation.model';
import { SubscriptionsModel } from '../models/subscriptions.model';
import { checkBusinessServiceSchedule } from '../utils/organization';
import { appConfig } from '../config';
import OpenAI from 'openai';

const { CustomerModel, WhatSappSettingsModel, OrganizationsModel } = models;

interface SendWhatSappMessageProps {
  WhatSappBusinessPhoneNumberId?: string;
  recipientPhoneNumber: string;
  access_token?: string;
  message?: string;
}

interface SendWhatSappCatalogProps {
  WhatSappBusinessPhoneNumberId?: string;
  recipientPhoneNumber: string;
  catalogUrl: string;
  productUrl: string;
  buttonText: string;
  bodyText: string;
}

interface SendWhatSappFlowProps {
  WhatSappBusinessPhoneNumberId?: string;
  recipientPhoneNumber: string;
  flowId: string;
  flowName: string;
  zones: { id: string; title: string }[];
  headingText: string;
  bodyText: string;
  buttonText: string;
  footerText?: string;
}

interface SendWhatSappBranchFlowProps {
  WhatSappBusinessPhoneNumberId?: string;
  recipientPhoneNumber: string;
  flowId: string;
  flowName: string;
  branches: { id: string; title: string }[];
  headingText: string;
  bodyText: string;
  buttonText: string;
  footerText?: string;
}

export class ChatService extends MCPChatBot {
  protected organizationId: string = '';
  protected conversationId: string = '';
  protected userPhoneNumber: string;
  protected organizationWhatsappId: string;
  protected whatsappAccessToken: string = '';
  protected WhatSappBusinessPhoneNumberId: string = '';
  protected WhatSappBusinessPhoneNumber: string = '';
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
    instance.WhatSappBusinessPhoneNumberId = data.whatsappPhoneNumberId;
    instance.WhatSappBusinessPhoneNumber = data.whatsappPhoneNumber;
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
    const customer = await CustomerModel.findOne({
      where: { phone: this.userPhoneNumber, organizationId: this.organizationId },
    });
    if (!customer) {
      const data = await CustomerModel.create({
        name: '',
        phone: this.userPhoneNumber,
        organizationId: this.organizationId,
        source: 'chatbot',
        status: 'active',
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

  public async processValidationQuery({
    userMessage,
    assistantMessage,
  }: {
    userMessage: string;
    assistantMessage: any;
  }) {
    const planOrg = await this.getOrganization();
    const OPENAI_API_KEY = appConfig.mcpKeys.openaiKey;

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const systemPrompt = createValidationSystemPrompt({ organizationData: planOrg });
    const res = await openai.responses.create({
      model: this.llm_model,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: assistantMessage },
        { role: 'user', content: userMessage },
      ],
    });

    return {
      data: {
        type: 'message',
        response: res.output_text,
      },
    };
  }

  public async processQuery(userMessage: string) {
    const planOrg = await this.getOrganization();
    const customer = await this.getCustomerData();
    console.log('🏃🏼🤔====================================');
    console.log(planOrg, customer);
    console.log('====================================');
    let systemPrompt: string;
    if (customer.status !== 'active') {
      return await this.processValidationQuery({
        userMessage,
        assistantMessage: `you have been blocked from sending message to ${planOrg.name}`,
      });
    }

    if (planOrg.status !== 'active') {
      return await this.processValidationQuery({
        userMessage,
        assistantMessage: `${planOrg.name} is currently not active at the moment`,
      });
    }

    const subscription = await SubscriptionsModel.findOne({ where: { organizationId: planOrg.id } });
    if (subscription?.status !== 'active') {
      return await this.processValidationQuery({
        userMessage,
        assistantMessage: `${planOrg.name} is currently not available at the moment`,
      });
    }

    const serviceSchedule = checkBusinessServiceSchedule(planOrg.serviceSchedule);
    if (!serviceSchedule?.isOpen) {
      // return await this.processValidationQuery({
      //   userMessage,
      //   assistantMessage: JSON.stringify(serviceSchedule),
      // });
      return {
        data: {
          type: 'message',
          response: 'الخدمة مغلقة حالياً',
        },
      };
    }

    systemPrompt = createSystemPrompt({
      organizationData: planOrg!,
      customerData: customer,
      businessTone: 'formal',
      assistantName: planOrg.AIAssistantName || 'Alex',
    });

    const conversation = await this.getAndCreateConversationIfNotExist(systemPrompt);
    if (planOrg.shouldUpdateChatbotSystemPrompt) {
      console.log('====================================');
      console.log('should update system prompt running');
      console.log('====================================');
      if (conversation) {
        const { deleteConversationItem, insertConverationItem } = new ChatHistoryManager();
        await deleteConversationItem({
          msgId: conversation.systemMessageId,
          conv: { conversation_id: conversation.id },
        });

        systemPrompt = createSystemPrompt({
          organizationData: planOrg!,
          customerData: customer,
          businessTone: 'formal',
          assistantName: planOrg.AIAssistantName || 'Alex',
        });

        const items = await insertConverationItem(conversation.id, systemPrompt);

        const systemMessage = items.data.find((i: any) => i.role === 'system');
        await Conversation.update(
          { systemMessageId: systemMessage?.id },
          { where: { organizationId: planOrg.id, id: conversation.id, customerId: customer.id } }
        );

        await OrganizationsModel.update({ shouldUpdateChatbotSystemPrompt: false }, { where: { id: planOrg.id } });
      }
    }
    await this.connectToMcpServer(conversation.id);
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

  async sendWhatSappCatalogInteractiveMessage(args: SendWhatSappCatalogProps) {
    const CATALOG_LINK = args.catalogUrl;
    const INAGE_PREVIEW = args.productUrl;
    const body = {
      messaging_product: 'whatsapp',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'cta_url',
        header: {
          type: 'image',
          image: {
            link: INAGE_PREVIEW,
          },
        },
        body: {
          text: args.bodyText || 'Check out our latest products 👇',
        },
        action: {
          name: 'cta_url',
          parameters: {
            display_text: args.buttonText || 'view catalog',
            url: CATALOG_LINK,
          },
        },
      },
    };

    try {
      const url = `https://graph.facebook.com/v20.0/${this.WhatSappBusinessPhoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.whatsappAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error ${res.status}: ${errorData.error.message}`);
      }
    } catch (error: any) {
      console.log('WHATSAPP-MESSAGE', error);
    }
  }

  async sendWhatSappFlowInteractiveMessage(args: SendWhatSappFlowProps) {
    const body = {
      messaging_product: 'whatsapp',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: args.headingText || 'Delivery Details',
        },
        body: {
          text: args.bodyText || 'Tap below to choose your delivery zone and area.',
        },
        footer: {
          text: args.footerText || 'CheeseAI Bot',
        },
        action: {
          name: 'flow',
          parameters: {
            flow_id: args.flowId,
            flow_message_version: '3',
            flow_token: 'prod-token-001',
            flow_cta: args.buttonText || 'Open form',
            mode: 'published',
            flow_action: 'navigate',
            flow_action_payload: {
              screen: 'ADDRESS_SELECTION',
              data: JSON.stringify({ status: 'active', zones: args.zones }),
            },
          },
        },
      },
    };

    try {
      const url = `https://graph.facebook.com/v20.0/${this.WhatSappBusinessPhoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.whatsappAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error ${res.status}: ${errorData.error.message}`);
      }
    } catch (error: any) {
      console.log('WHATSAPP-MESSAGE', error);
    }
  }

  async sendWhatSappBranchFlowInteractiveMessage(args: SendWhatSappBranchFlowProps) {
    const body = {
      messaging_product: 'whatsapp',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: args?.headingText || 'Branch Details',
        },
        body: {
          text: args?.bodyText || 'Tap below to choose branch.',
        },
        footer: {
          text: args?.footerText || 'CheeseAI Bot',
        },
        action: {
          name: 'flow',
          parameters: {
            flow_id: args.flowId,
            flow_message_version: '3',
            flow_cta: args?.buttonText || 'Open form',
            mode: 'published',
            flow_action: 'navigate',
            flow_action_payload: {
              screen: 'BRANCH_SELECTION',
              data: JSON.stringify({ status: 'active', branches: args.branches }),
            },
          },
        },
      },
    };

    try {
      const url = `https://graph.facebook.com/v20.0/${this.WhatSappBusinessPhoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.whatsappAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error ${res.status}: ${errorData.error.message}`);
      }
    } catch (error: any) {
      console.log('WHATSAPP-MESSAGE', error);
    }
  }
}
