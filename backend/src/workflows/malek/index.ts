import { OrderFlowStep } from '../../data/data-types';
import {
  ChooseLangeContent,
  FlowContent,
  FlowType,
  getFlowContent,
  GreetingsFlowContent,
} from '../../data/flow-static-data';
import { deleteMessageFromRedis, getMessageFromRedis, setMessageInRedis } from '../../helpers/redis';
import { models } from '../../models';
import { WhatsappFlowLabel } from '../../types/whatsapp-settings';
import { WhatsAppMessage } from '../../types/whatsapp-webhook';
import { decrypt } from '../../utils/crypto-utils';

const { CustomerModel, WhatSappSettingsModel, OrganizationsModel, ProductModel, BranchesModel, ZoneModel } = models;

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

  async sendWhatSappAreaAndZoneFlowInteractiveMessage(args: SendWhatSappFlowProps) {
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
      [OrderFlowStep.CATALOG_SELECTION]: this.handleCatalogSelection,
      [OrderFlowStep.ADDRESS_SELECTION]: this.handleAddressSelection,
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
    console.log('====================================');
    console.log('handleLanguageSelection');
    console.log('====================================');
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
          nextStep: OrderFlowStep.SERVICE_SELECTION,
          updatedDraft: { ...draft, lang: 'en', step: OrderFlowStep.SERVICE_SELECTION },
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
          updatedDraft: { ...draft, lang: 'ar', step: OrderFlowStep.SERVICE_SELECTION },
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
    if (msg?.interactive?.type === 'list_reply') {
      const listPayload = msg?.interactive?.list_reply as any;
      if (listPayload.id === 'item_1') {
        const branches = await BranchesModel.findAll({ where: { organizationId: this.organizationId } });

        if (branches?.length === 0) {
          return {
            content: [{ type: 'text', text: 'No branch was found for this organization' }],
          };
        }

        const filteredBranches = branches.map((z) => ({ id: z.id, title: z.name }));
        const whatsappSettings = await WhatSappSettingsModel.findOne({
          where: { organizationId: this.organizationId },
        });

        const flow = whatsappSettings?.whatsappTemplates?.find(
          (w) => w.type === 'flow' && w.data?.flowLabel === WhatsappFlowLabel.BRANCHES_FLOW
        );

        const branchesFlowData = {
          branches: filteredBranches,
          flowId: flow?.type === 'flow' && flow?.data.flowId,
          flowName: flow?.type === 'flow' && flow?.data.flowName,
        };
        const flowContent = getFlowContent('branch-flow', draft.lang);
        const res = await this.sendWhatSappBranchFlowInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
          flowId: branchesFlowData.flowId as string,
          flowName: branchesFlowData.flowName as string,
          branches: branchesFlowData.branches,
        });
        return {
          updatedDraft: { ...draft, step: OrderFlowStep.ADDRESS_SELECTION },
          response: res,
        };
      } else if (listPayload.id === 'item_2') {
        const zones = await ZoneModel.findAll({
          where: { organizationId: this.organizationId },
        });

        const filteredZones = zones.map((z) => ({ id: z.id, title: z.name }));
        const whatsappSettings = await WhatSappSettingsModel.findOne({
          where: { organizationId: this.organizationId },
        });

        const flow = whatsappSettings?.whatsappTemplates.find(
          (w) => w.type === 'flow' && w.data?.flowLabel === WhatsappFlowLabel.ZONE_AND_AREAS_FLOW
        );
        const areaAndZone = {
          zones: filteredZones,
          flowId: flow?.type === 'flow' && flow?.data.flowId,
          flowName: flow?.type === 'flow' && flow?.data.flowName,
        };
        const flowContent = getFlowContent('catalog-flow', draft.lang);
        const res = await this.sendWhatSappAreaAndZoneFlowInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
          flowId: areaAndZone.flowId as string,
          flowName: areaAndZone.flowName as string,
          zones: areaAndZone.zones,
        });
        return {
          updatedDraft: { ...draft, step: OrderFlowStep.ADDRESS_SELECTION },
          response: res,
        };
      } else if (listPayload.id === 'item_3') {
        const org = await this.getOrganization();
        const enMsg = `Please contact our customer service at ${org.hotline}. If you prefer to speak with a human, you can call the same number`;
        const arMsg = `يرجى التواصل مع خدمة العملاء على الرقم ${org.hotline}. إذا كنت تفضل التحدث مع أحد ممثلي الخدمة، يمكنك الاتصال بنفس الرقم`;
        const res = await this.sendWhatSappMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          message: draft.lang === 'en' ? enMsg : arMsg,
        });
        await deleteMessageFromRedis(this.userPhoneNumber);
        return {
          updatedDraft: null,
          response: res,
        };
      } else {
        console.log('====================================');
        console.log('default else');
        console.log('====================================');
        const flowContent = getFlowContent('choose-lang-flow', 'en');
        const res = await this.sendWhatSappSChooseLangInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
        });
        return {
          nextStep: OrderFlowStep.SERVICE_SELECTION,
          updatedDraft: null,
          response: res,
        };
      }
    }
  }

  private async handleAddressSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    console.log('====================================');
    console.log('handleAddressSelection');
    console.log('====================================');
  }

  private async handleCatalogSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    console.log('====================================');
    console.log('handleCatalogSelection');
    console.log('====================================');
    if (msg?.interactive?.type === 'list_reply') {
      const getCatalogLink = async () => {
        const orgBusinessWhatsappData = await WhatSappSettingsModel.findOne({
          where: { organizationId: this.organizationId },
        });
        if (!orgBusinessWhatsappData) throw new Error('whatsapp business data could not be retrieved');
        const product = await ProductModel.findOne({ where: { organizationId: this.organizationId } });

        return {
          catalogUrl: `https://wa.me/c/${orgBusinessWhatsappData.whatsappPhoneNumber.trim()}`.replace(/\s+/g, ''),
          productUrl: product?.imageUrl || '',
        };
      };
      const listPayload = msg?.interactive?.list_reply as any;
      if (listPayload.id === 'item_1') {
        const catalog = await getCatalogLink();
        const flowContent = getFlowContent('catalog-flow', 'en');
        const res = await this.sendWhatSappCatalogInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
          ...catalog,
        });
        return {
          nextStep: OrderFlowStep.LANGUAGE_SELECTION,
          updatedDraft: { ...draft, lang: 'en' },
          response: res,
        };
      } else if (listPayload.id === 'item_2') {
        const catalog = await getCatalogLink();
        const flowContent = getFlowContent('catalog-flow', 'en');
        const res = await this.sendWhatSappCatalogInteractiveMessage({
          recipientPhoneNumber: this.userPhoneNumber,
          ...flowContent,
          ...catalog,
        });
        return {
          nextStep: OrderFlowStep.SERVICE_SELECTION,
          updatedDraft: { ...draft, lang: 'ar' },
          response: res,
        };
      } else if (listPayload.id === 'item_3') {
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

interface SendWhatSappMessageProps {
  recipientPhoneNumber: string;
  message: string;
}
interface SendWhatSappChooseLangProps extends ChooseLangeContent {
  recipientPhoneNumber: string;
}

interface SendWhatSappGreetingsProps extends GreetingsFlowContent {
  recipientPhoneNumber: string;
}

interface SendWhatSappCatalogProps extends FlowContent {
  recipientPhoneNumber: string;
  catalogUrl: string;
  productUrl: string;
}

interface SendWhatSappBranchFlowProps extends FlowContent {
  recipientPhoneNumber: string;
  flowId: string;
  flowName?: string;
  branches: { id: string; title: string }[];
}

interface SendWhatSappFlowProps extends FlowContent {
  recipientPhoneNumber: string;
  flowId: string;
  flowName?: string;
  zones: { id: string; title: string }[];
}
