import { ChatHistoryManager } from '../services/ChatHistoryManager.service';
import { models } from '../models';
import { createSystemPrompt, createValidationSystemPrompt } from './prompts';
import { decrypt } from '../utils/crypto-utils';
import { Conversation } from '../models/conversation.model';
import { SubscriptionsModel } from '../models/subscriptions.model';
import { checkBusinessServiceSchedule } from '../utils/organization';
import { appConfig } from '../config';
import OpenAI from 'openai';
import { bot } from '../bot';
import { scheduleFollowup } from '../helpers/rabbitmq/followUpQueue';
import { ICustomer } from '../types/customers';
import { WhatsappFlowLabel } from '../types/whatsapp-settings';

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

interface SendWhatSappOrderedItemsFlowProps {
  WhatSappBusinessPhoneNumberId?: string;
  recipientPhoneNumber: string;
  flowId: string;
  flowName: string;
  items: { id: string; title: string }[];
  headingText: string;
  bodyText: string;
  buttonText: string;
  footerText?: string;
}

interface SendWhatSappProductOptionsFlowProps {
  WhatSappBusinessPhoneNumberId?: string;
  recipientPhoneNumber: string;
  flowId: string;
  flowName: string;
  productName: string;
  productOptions: any;
  headingText: string;
  bodyText: string;
  buttonText: string;
  footerText?: string;
}

interface SendWhatSappGreetingsProps {
  WhatSappBusinessPhoneNumberId?: string;
  recipientPhoneNumber: string;
  headingText: string;
  bodyText: string;
  buttonText: string;
  footerText?: string;
}

export class ChatService {
  protected organizationId: string = '';
  protected conversationId: string = '';
  protected userPhoneNumber: string;
  protected organizationWhatsappId: string;
  protected whatsappAccessToken: string = '';
  protected WhatSappBusinessPhoneNumberId: string = '';
  protected WhatSappBusinessPhoneNumber: string = '';
  constructor(userPhoneNumber: string, organizationWhatsappId: string) {
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

  private async getAndCreateConversationIfNotExist(systemPrompt: string, userRespondedToFollowUp = true) {
    const chatHistory = new ChatHistoryManager();
    const customer = await this.getCustomerData();
    const conversation = await chatHistory.getConversationsByCustomerId(customer.id, this.organizationId);
    if (conversation?.userRespondedToFollowupAt) {
      const diff = Date.now() - new Date(conversation.userRespondedToFollowupAt).getTime();

      if (diff >= 20 * 60 * 1000) {
        // 10 minutes has passed, user didn't respond to follow-up
        console.log('====================================');
        console.log('😂 creating new conversation after 10mins of no response');
        console.log('====================================');
        const conv = await chatHistory.createConversation({
          organizationId: this.organizationId,
          customerId: customer.id,
          systemPrompt: systemPrompt,
        });
        return conv?.get({ plain: true });
      }
    }
    if (!conversation) {
      const conv = await chatHistory.createConversation({
        organizationId: this.organizationId,
        customerId: customer.id,
        systemPrompt: systemPrompt,
      });
      return conv?.get({ plain: true });
    }

    if (userRespondedToFollowUp) {
      await Conversation.update(
        { followup_token: '', followup_sent: false, userRespondedToFollowupAt: new Date() },
        { where: { id: conversation.id } }
      ); //invalidate followup token
    }
    return conversation;
  }

  public async processValidationQuery({
    userMessage,
    assistantMessage,
    customer,
  }: {
    userMessage: string;
    assistantMessage: any;
    customer: ICustomer;
  }) {
    const planOrg = await this.getOrganization();
    const systemPrompt = createValidationSystemPrompt({ organizationData: planOrg });
    const OPENAI_API_KEY = appConfig.mcpKeys.openaiKey;
    const chatHistory = new ChatHistoryManager();
    const conversation = await this.getAndCreateConversationIfNotExist(systemPrompt);

    await chatHistory.addMessage(
      { conversationId: conversation.id!, organizationId: this.organizationId },
      { role: 'user', content: userMessage }
    );

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const res = await openai.responses.create({
      model: bot.llm_model,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: assistantMessage },
        { role: 'user', content: userMessage },
      ],
    });

    await chatHistory.addMessage(
      { conversationId: conversation?.id!, organizationId: this.organizationId },
      { role: 'assistant', content: res.output_text }
    );

    await CustomerModel.update({ shouldUpdateChatbotSystemPrompt: true }, { where: { id: customer.id } });

    return {
      data: {
        type: 'message',
        response: res.output_text,
      },
    };
  }

  public async processQuery(userMessage: string, options?: { userRespondedToFollowUp?: boolean }) {
    const planOrg = await this.getOrganization();
    const customer = await this.getCustomerData();

    if (customer.status !== 'active') {
      return await this.processValidationQuery({
        userMessage,
        assistantMessage: `you have been blocked from sending message to ${planOrg.name}`,
        customer,
      });
    }

    if (planOrg.status !== 'active') {
      return await this.processValidationQuery({
        userMessage,
        assistantMessage: `${planOrg.name} is currently not active at the moment`,
        customer,
      });
    }

    const subscription = await SubscriptionsModel.findOne({ where: { organizationId: planOrg.id } });
    if (subscription?.status !== 'active') {
      return await this.processValidationQuery({
        userMessage,
        assistantMessage: `${planOrg.name} is currently not available at the moment`,
        customer,
      });
    }

    const serviceSchedule = checkBusinessServiceSchedule(planOrg.serviceSchedule, planOrg.timeZone! || 'UTC');

    if (!serviceSchedule?.isOpen) {
      return await this.processValidationQuery({
        userMessage,
        assistantMessage: JSON.stringify(serviceSchedule),
        customer,
      });
    }

    let systemPrompt: string;
    systemPrompt = createSystemPrompt({
      organizationData: planOrg!,
      customerData: customer,
      businessTone: 'formal',
      assistantName: planOrg.AIAssistantName || 'Alex',
    });

    const conversation = await this.getAndCreateConversationIfNotExist(systemPrompt, options?.userRespondedToFollowUp);

    if (planOrg.shouldUpdateChatbotSystemPrompt || customer.shouldUpdateChatbotSystemPrompt) {
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
        await CustomerModel.update(
          { shouldUpdateChatbotSystemPrompt: false },
          { where: { id: customer.id, organizationId: planOrg.id } }
        );
      }
    }

    const res = await bot.process({
      query: userMessage,
      systemPrompt: systemPrompt,
      organizationId: this.organizationId,
      conversationId: conversation.id,
      customerId: customer.id,
    });

    // await scheduleFollowup({
    //   userPhoneNumber: customer.phone,
    //   conversationId: conversation.id,
    //   customerId: customer.id,
    //   organizationId: this.organizationId,
    // });
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

  async sendWhatSappOrderedItemsFlowInteractiveMessage(args: SendWhatSappOrderedItemsFlowProps) {
    function addPrefixToIds(items: { id: string; title: string }[]) {
      return items.map((item, index) => ({
        ...item,
        id: `${item.id}__${index}`, // originalId__index
      }));
    }
    const body = {
      messaging_product: 'whatsapp',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: args?.headingText || 'items',
        },
        body: {
          text: args?.bodyText || 'select the item you want to edit.',
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
              screen: 'ITEMS_SELECTION',
              data: JSON.stringify({
                status: 'active',
                items: addPrefixToIds(args.items),
                flowLabel: WhatsappFlowLabel.PRODUCT_ITEMS_FLOW,
              }),
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

  async sendWhatSappProductOptionFlowInteractiveMessage(args: SendWhatSappProductOptionsFlowProps) {
    const body = {
      messaging_product: 'whatsapp',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: args?.headingText || 'Product Options',
        },
        body: {
          text: args?.bodyText || 'Tap below to choose product options.',
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
              screen: 'PRODUCT_OPTIONS_SELECTIONS',
              data: JSON.stringify({
                status: 'active',
                ...args.productOptions,
                productName: args.productName,
                flowLabel: WhatsappFlowLabel.PRODUCT_OPTIONS_FLOW,
              }),
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

  async sendWhatSappGreetingInteractiveMessage(args: SendWhatSappGreetingsProps) {
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: args.bodyText,
        },
        footer: {
          text: args.footerText,
        },
        action: {
          button: args.buttonText,
          sections: [
            {
              title: 'Menu',
              rows: [
                {
                  id: 'item_1',
                  title: 'Takeaway',
                  description: 'I want to place an order for takeway',
                },
                {
                  id: 'item_2',
                  title: 'Delivery',
                  description: 'I want to place an order for delivery',
                },
                {
                  id: 'item_3',
                  title: 'Customer Service',
                  description: 'I want to contact the your customer service',
                },
              ],
            },
          ],
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

  async sendWhatSappOrderSummaryInteractiveMessage(args: SendWhatSappGreetingsProps) {
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: args.bodyText,
        },
        footer: {
          text: args.footerText,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'confirm_order',
                title: 'Confirm',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'edit_order',
                title: 'Edit',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'cancel_order',
                title: 'Cancel',
              },
            },
          ],
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

    async sendWhatSappSingleUpsellingProductInteractiveMessage(args: SendWhatSappGreetingsProps) {
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: args.bodyText,
        },
        footer: {
          text: args.footerText,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'add_item',
                title: 'Yes',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'no_add_item',
                title: 'No',
              },
            },
          ],
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

    async sendWhatSappKUPsellingItemsFlowInteractiveMessage(args: SendWhatSappOrderedItemsFlowProps) {
    const body = {
      messaging_product: 'whatsapp',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: args?.headingText || 'items',
        },
        body: {
          text: args?.bodyText || 'select the item you want to edit.',
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
              screen: 'ITEMS_SELECTION',
              data: JSON.stringify({
                status: 'active',
                items: args.items,
                flowLabel: WhatsappFlowLabel.PRODUCT_ITEMS_FLOW,
              }),
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
