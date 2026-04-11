import { OrderFlowStep } from '../../data/data-types';
import { ChooseLangeContent, FlowType, getFlowContent, GreetingsFlowContent } from '../../data/flow-static-data';
import { getMessageFromRedis, setMessageInRedis } from '../../helpers/redis';
import { models } from '../../models';
import { WhatsAppMessage } from '../../types/whatsapp-webhook';
import { decrypt } from '../../utils/crypto-utils';

const { CustomerModel, WhatSappSettingsModel, OrganizationsModel } = models;

export const handleIncommingMessageForMalek = async (whatsappBusinessId: string, msg: WhatsAppMessage) => {
  try {
    const userPhoneNumber = msg.from;

    const chat = await MalekChatService.init(userPhoneNumber, whatsappBusinessId);
    const res = await chat.proceswWorkflow(msg);
  } catch (error: any) {
    console.log('===================malek-workflow-error=================');
    console.log(error.message);
    console.log('===================malek-workflow-error=================');
  }
};

export class MalekChatService {
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
    const instance = new MalekChatService(userPhoneNumber, organizationWhatsappId);

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
    return org.get({ plain: true });
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

  async sendWhatSappSChooseLangInteractiveMessage(args: SendWhatSappChooseLangProps) {
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: args.bodyText },
        footer: { text: args.footerText },
        action: {
          buttons: args.buttonTexts.map((btn) => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title,
            },
          })),
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
    } catch (error) {
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
              rows: args.menuItems,
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

  // -----------------------------
  // STEP ROUTER (NEW CORE LOGIC)
  // -----------------------------

  async proceswWorkflow(userMessage: WhatsAppMessage) {
    const workflowDraft = (await getMessageFromRedis(this.userPhoneNumber)) as WorkflowDraft;
    console.log('====================workflowDraft================');
    console.log(workflowDraft);
    console.log('====================================');
    // FIRST TIME USER
    if (!workflowDraft) {
      return await this.startWorkflow();
    }

    // route to step handler
    const handler = this.getStepHandler(workflowDraft.step as any);

    if (!handler) throw new Error(`No handler for step: ${workflowDraft.step}`);

    const result = await handler.call(this, workflowDraft, userMessage);

    // persist state update ONLY here
    if (result?.updatedDraft) {
      await setMessageInRedis(this.userPhoneNumber, {
        ...result.updatedDraft,
      } as any);
    }

    return await result?.response;
  }

  // -----------------------------
  // START FLOW
  // -----------------------------
  private async startWorkflow() {
    const customer = await this.getCustomerData();

    const payload: Partial<WorkflowDraft> = {
      lang: 'en',
      customerId: customer.id,
      phoneNumber: this.userPhoneNumber,
      step: OrderFlowStep.LANGUAGE_SELECTION,
    };

    await setMessageInRedis(this.userPhoneNumber, payload as any);

    const flowContent = getFlowContent('choose-lang-flow', payload.lang || 'en');

    return await this.sendWhatSappSChooseLangInteractiveMessage({
      recipientPhoneNumber: this.userPhoneNumber,
      ...flowContent,
    });
  }

  // -----------------------------
  // STEP ROUTER MAP
  // -----------------------------
  private getStepHandler(step: OrderFlowStep): StepHandler {
    const handlers: any = {
      [OrderFlowStep.LANGUAGE_SELECTION]: this.handleLanguageSelection,
      [OrderFlowStep.SERVICE_SELECTION]: this.handleServiceSelection,
      // [OrderFlowStep.CATALOG_SELECTION]: this.handleCatalogSelection,
      // [OrderFlowStep.PRODUCT_OPTIONS]: this.handleProductOptions,
      // [OrderFlowStep.UPSELLING]: this.handleUpselling,
      // [OrderFlowStep.ORDER_SUMMARY]: this.handleOrderSummary,
      // [OrderFlowStep.ORDER_COMPLETION]: this.handleOrderCompletion,
    };

    const handler = handlers[step];

    if (!handler) {
      throw new Error(`No handler for step: ${step}`);
    }

    return handler;
  }

  // -----------------------------
  // STEP HANDLER
  // -----------------------------
  private async handleLanguageSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    if (msg?.interactive?.type === 'button_reply') {
      const listPayload = msg?.interactive?.button_reply as any;
      if (listPayload.id === 'en') {
        console.log('====================================');
        console.log('LANGUAGE_SELECTION', listPayload.id);
        console.log('====================================');
        const flowContent = getFlowContent('greeting-flow', 'en');
        const res = await this.sendWhatSappGreetingInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
        });
        return {
          nextStep: OrderFlowStep.LANGUAGE_SELECTION,
          updatedDraft: { ...draft, lang: 'en' },
          response: res,
        };
      } else if (listPayload.id === 'ar') {
        const flowContent = getFlowContent('greeting-flow', 'ar');
        const res = await this.sendWhatSappGreetingInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
        });
        return {
          nextStep: OrderFlowStep.SERVICE_SELECTION,
          updatedDraft: { ...draft, lang: 'ar' },
          response: res,
        };
      } else {
        const flowContent = getFlowContent('choose-lang-flow', 'en');
        const res = await this.sendWhatSappSChooseLangInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
        });
        return {
          nextStep: OrderFlowStep.LANGUAGE_SELECTION,
          updatedDraft: null,
          response: res,
        };
      }
    }
  }

  private async handleServiceSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    console.log('====================================');
    console.log('handleServiceSelection');
    console.log('====================================');
    if (msg?.interactive?.type === 'button_reply') {
      const listPayload = msg?.interactive?.button_reply as any;
      if (listPayload.id === 'en') {
        const flowContent = getFlowContent('greeting-flow', 'en');
        const res = await this.sendWhatSappGreetingInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
        });
        return {
          nextStep: OrderFlowStep.LANGUAGE_SELECTION,
          updatedDraft: { ...draft, lang: 'en' },
          response: res,
        };
      } else if (listPayload.id === 'ar') {
        const flowContent = getFlowContent('greeting-flow', 'ar');
        const res = await this.sendWhatSappGreetingInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
        });
        return {
          nextStep: OrderFlowStep.SERVICE_SELECTION,
          updatedDraft: { ...draft, lang: 'ar' },
          response: res,
        };
      } else {
        const flowContent = getFlowContent('choose-lang-flow', 'en');
        const res = await this.sendWhatSappSChooseLangInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
        });
        return {
          nextStep: OrderFlowStep.LANGUAGE_SELECTION,
          updatedDraft: null,
          response: res,
        };
      }
    }
  }
}

export interface WorkflowDraft {
  phoneNumber: string;
  customerId: string;
  lang: 'en' | 'ar';
  step: `${OrderFlowStep}`;
  orderDetails: {
    organizationId: string;
    customerId: string;
    branchId: string;
    currency: string;
    deliveryAreaId: string;
    shippingAddress: string;
    serviceType: 'delivery' | 'takeaway';
    subtotal: number;
    deliveryCharge: number;
    totalAmount: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      selectedOptions: {
        optionId: string;
        optionName: string;
        choiceId: string;
        choiceLabel: string;
        priceAdjustment: string;
      }[];
    }[];
  };
}

type StepHandlerResult = {
  nextStep: OrderFlowStep;
  updatedDraft: Partial<WorkflowDraft>;
  response: any;
};

type StepHandler = (draft: WorkflowDraft, userMessage: any) => Promise<StepHandlerResult>;

interface SendWhatSappChooseLangProps extends ChooseLangeContent {
  recipientPhoneNumber: string;
}

interface SendWhatSappGreetingsProps extends GreetingsFlowContent {
  recipientPhoneNumber: string;
}
