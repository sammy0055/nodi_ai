import { Op } from 'sequelize';
import { OrderFlowStep } from '../../data/data-types';
import {
  ChooseLangeContent,
  FlowContent,
  FlowType,
  getFlowContent,
  GreetingsFlowContent,
  OrderSummaryContent,
  SingleUpsellingContent,
} from '../../data/flow-static-data';
import { deleteMessageFromRedis, getMessageFromRedis, setMessageInRedis } from '../../helpers/redis';
import { models } from '../../models';
import { WhatsappFlowLabel } from '../../types/whatsapp-settings';
import { WhatsAppMessage } from '../../types/whatsapp-webhook';
import { decrypt } from '../../utils/crypto-utils';
import { IProduct } from '../../types/product';
import { ProductOption } from '../../types/product-option';
import { generateOrderText } from '../utils';
import { productOptionsTaxonomy } from '../../data/taxonomy';
import { getEstimatedTime } from '../../utils/getEstimatedTime';
import { OrderModel } from '../../models/order.module';

const {
  CustomerModel,
  WhatSappSettingsModel,
  OrganizationsModel,
  ProductModel,
  BranchesModel,
  ZoneModel,
  AreaModel,
  ProductOptionChoiceModel,
  ProductOptionModel,
} = models;

export const handleIncommingMessageForMalek = async (whatsappBusinessId: string, msg: WhatsAppMessage) => {
  try {
    const userPhoneNumber = msg.from;

    const chat = await MalekChatService.init(userPhoneNumber, whatsappBusinessId);
    const res = await chat.proceswWorkflow(msg);
  } catch (error: any) {
    await deleteMessageFromRedis(msg.from);
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
  async sendWhatSappCustomizeOrderInteractiveMessage(args: SendWhatSappChooseLangProps) {
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

  async sendWhatSappMultiUPsellingItemsFlowInteractiveMessage(args: SendWhatSappMultiUpsellingProps) {
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
                flowLabel: WhatsappFlowLabel.UPSELLING_ITEMS_FLOW,
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

  async sendWhatSappSingleUpsellingProductInteractiveMessage(args: SendWhatSappSingleUpsellingProps) {
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
    } catch (error: any) {
      console.log('WHATSAPP-MESSAGE', error);
    }
  }

  async sendWhatSappOrderSummaryInteractiveMessage(args: SendWhatSappOrderSummaryProps) {
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
    console.log(JSON.stringify(workflowDraft));
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
      [OrderFlowStep.CUSTOMIZE_ORDER_SELECTION]: this.handleCustomizeOrderSelection,
      [OrderFlowStep.OPTIONS_ITEM_COLLECTION]: this.handleOptionItemSelection,
      [OrderFlowStep.UPSELLING]: this.handleUpsellingSelection,
      [OrderFlowStep.UPSELLING_OPTIONS_ITEM_COLLECTION]: this.handleUpsellingItemOptionSelection,
      // [OrderFlowStep.PRODUCT_OPTIONS]: this.handleProductOptions,
      // [OrderFlowStep.ORDER_SUMMARY]: this.handleOrderSummary,
      [OrderFlowStep.ORDER_COMPLETION]: this.handleOrderCompletion,
    };

    const handler = handlers[step];

    if (!handler) {
      throw new Error(`No handler for step: ${step}`);
    }

    return handler;
  }

  private async getCatalogLink() {
    const orgBusinessWhatsappData = await WhatSappSettingsModel.findOne({
      where: { organizationId: this.organizationId },
    });
    if (!orgBusinessWhatsappData) throw new Error('whatsapp business data could not be retrieved');
    const product = await ProductModel.findOne({ where: { organizationId: this.organizationId } });

    return {
      catalogUrl: `https://wa.me/c/${orgBusinessWhatsappData.whatsappPhoneNumber.trim()}`.replace(/\s+/g, ''),
      productUrl: product?.imageUrl || '',
    };
  }
  // -----------------------------
  // STEP HANDLER dynamic functions
  // -----------------------------
  private async ProcessDeliveryHandler(draft: WorkflowDraft, msg: WhatsAppMessage) {
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
    const flowContent = getFlowContent('area-and-zone-flow', draft.lang);
    const res = await this.sendWhatSappAreaAndZoneFlowInteractiveMessage({
      recipientPhoneNumber: this.userPhoneNumber,
      ...flowContent,
      flowId: areaAndZone.flowId as string,
      flowName: areaAndZone.flowName as string,
      zones: areaAndZone.zones,
    });
    return {
      updatedDraft: { ...draft },
      response: res,
    };
  }
  private async ProcessTakeawayHandler(draft: WorkflowDraft, msg: WhatsAppMessage) {
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
      updatedDraft: { ...draft },
      response: res,
    };
  }
  private async processOrderSummaryHandler(draft: WorkflowDraft, msg: WhatsAppMessage) {
    const org = await this.getOrganization();
    const products = draft.orderDetails.items.map((i) => {
      const options =
        i.selectedOptions && i.selectedOptions.length > 0
          ? `\nOptions:\n${i.selectedOptions
              .map((op) => `- ${op.choiceLabel} (${org.currency} ${op.priceAdjustment})`)
              .join('\n')}`
          : '';

      return `${i.productName} (${org.currency} ${i.price})${options}`;
    });
    const order = draft.orderDetails;
    const productTotal = order.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const total = productTotal + (order.deliveryCharge || 0);
    const generateOrderSummaryText = generateOrderText(draft.lang);

    const summaryText = generateOrderSummaryText({
      total,
      items: products,
      type: draft.orderDetails.serviceType,
      deliveryCharge: draft.orderDetails?.deliveryCharge,
      address: order?.shippingAddress,
      branch: order?.branchName,
      area: order?.deliveryAreaName,
      estimatedTime: order?.deliveryTime,
      currency: org.currency,
    });

    const flowContent = getFlowContent('order-summary-flow', draft.lang);
    flowContent.bodyText = summaryText;
    const res = await this.sendWhatSappOrderSummaryInteractiveMessage({
      recipientPhoneNumber: this.userPhoneNumber,
      ...flowContent,
    });

    const updatedDraft: WorkflowDraft = {
      ...draft,
      step: OrderFlowStep.ORDER_COMPLETION,
      orderDetails: {
        ...draft.orderDetails,
        subtotal: productTotal,
        totalAmount: total,
        currency: org.currency,
      },
    };

    return {
      updatedDraft: updatedDraft,
      response: res,
    };
  }
  private async processUpsellingHandler(draft: WorkflowDraft, msg: WhatsAppMessage) {
    const upsellingProducts = await ProductModel.findAll({
      where: { organizationId: this.organizationId, isUpSelling: true },
      include: [
        {
          model: ProductOptionModel,
          as: 'options',
          include: [{ model: ProductOptionChoiceModel, as: 'choices' }],
        },
      ],
    });

    const items = upsellingProducts.map((item) => ({ id: item.id, title: item.name }));

    if (items.length === 1) {
      const flowContent = getFlowContent('single-upselling-flow', draft.lang);
      const enBodyText = `Would you like to add ${items[0].title}?`;
      const arBodyText = `هل ترغب في إضافة ${items[0].title} إلى طلبك؟`;
      draft.lang === 'en' ? (flowContent.bodyText = enBodyText) : (flowContent.bodyText = arBodyText);
      const res = await this.sendWhatSappSingleUpsellingProductInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
      });

      const updatedDraft: WorkflowDraft = {
        ...draft,
        step: OrderFlowStep.UPSELLING,
        upsellingProducts: upsellingProducts as any,
      };

      return {
        updatedDraft: updatedDraft,
        response: res,
      };
    } else if (items.length > 1) {
      // multi upselling
      const whatsappSettings = await WhatSappSettingsModel.findOne({
        where: { organizationId: this.organizationId },
      });

      const flow = whatsappSettings?.whatsappTemplates?.find(
        (w) => w.type === 'flow' && w.data?.flowLabel === WhatsappFlowLabel.PRODUCT_ITEMS_FLOW
      );

      const flowContent = getFlowContent('multi-upselling-flow', draft.lang);
      const res = await this.sendWhatSappMultiUPsellingItemsFlowInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
        flowId: flow?.type === 'flow' && (flow?.data.flowId as any),
        flowName: flow?.type === 'flow' && (flow?.data.flowName as any),
        items,
      });

      const updatedDraft: WorkflowDraft = {
        ...draft,
        step: OrderFlowStep.UPSELLING,
        upsellingProducts: upsellingProducts as any,
      };

      return {
        updatedDraft: updatedDraft,
        response: res,
      };
    } else {
      return await this.processOrderSummaryHandler(draft, msg);
    }
  }
  private async orderModificationHandler(draft: WorkflowDraft, msg: WhatsAppMessage) {
    const product = draft.selectedProducts.find((i) => !i.isOptionAdded && i?.options?.length > 0);
    if (product) {
      const org = await this.getOrganization();
      const whatsappSettings = await WhatSappSettingsModel.findOne({
        where: { organizationId: this.organizationId },
      });

      const flow = whatsappSettings?.whatsappTemplates?.find(
        (w) => w.type === 'flow' && w.data?.flowLabel === WhatsappFlowLabel.PRODUCT_OPTIONS_FLOW
      );

      function formatNumber(num: number, locale = 'en-US') {
        if (num === null || num === undefined) return '';

        const number = new Intl.NumberFormat(locale).format(num);
        return `${org?.currency} ${number}`;
      }

      const productOptions = product.options.map((item: any) => ({
        [item.name.replace(/\s+/g, '_')]: {
          visible: true,
          required: item.isRequired,
          label: item.name.replace(/_/g, ' '),
          description: item.description,
          options: item.choices?.map((choice: any) => ({
            id: choice.id,
            title: `${choice.label} ${choice.priceAdjustment !== 0 ? formatNumber(choice.priceAdjustment) : ''}`,
          })),
        },
      }));

      let found = false;
      const updatedProducts = draft.selectedProducts.map((i) => {
        if (!found && i.id === product.id && !i?.isOptionAdded) {
          found = true;
          return { ...i, isOptionAdded: true };
        }
        return i;
      });

      const updatedDraft: WorkflowDraft = {
        ...draft,
        selectedProducts: updatedProducts,
        step: OrderFlowStep.OPTIONS_ITEM_COLLECTION,
      };

      const productOptionsObject = productOptions?.reduce((acc, item) => ({ ...acc, ...item }), {});

      const flowContent = getFlowContent('product-option-flow', draft.lang);
      const enBodyText = `Please select the modifications for ${product.name}`;
      const arBodyText = `يرجى اختيار التعديلات الخاصة بـ ${product.name}`;
      draft.lang === 'en' ? (flowContent.bodyText = enBodyText) : (flowContent.bodyText = arBodyText);
      const res = await this.sendWhatSappProductOptionFlowInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
        flowId: flow?.type === 'flow' && (flow?.data.flowId as any),
        flowName: flow?.type === 'flow' && (flow?.data.flowName as any),
        productName: product.name,
        productOptions: productOptionsObject,
      });

      return {
        updatedDraft: updatedDraft,
        response: res,
      };
    }
    if (!product) {
      return await this.processUpsellingHandler(draft, msg);
    }
  }
  private async upsellingProductOptionsHandler(draft: WorkflowDraft, msg: WhatsAppMessage) {
    const upSellingProduct = draft.upsellingProducts.find((i) => !i.isOptionAdded && i?.options?.length > 0);
    if (upSellingProduct) {
      const org = await this.getOrganization();
      const whatsappSettings = await WhatSappSettingsModel.findOne({
        where: { organizationId: this.organizationId },
      });

      const flow = whatsappSettings?.whatsappTemplates?.find(
        (w) => w.type === 'flow' && w.data?.flowLabel === WhatsappFlowLabel.PRODUCT_OPTIONS_FLOW
      );

      function formatNumber(num: number, locale = 'en-US') {
        if (num === null || num === undefined) return '';

        const number = new Intl.NumberFormat(locale).format(num);
        return `${org?.currency} ${number}`;
      }

      const productOptions = upSellingProduct.options.map((item: any) => ({
        [item.name.replace(/\s+/g, '_')]: {
          visible: true,
          required: item.isRequired,
          label: item.name.replace(/_/g, ' '),
          description: item.description,
          options: item.choices?.map((choice: any) => ({
            id: choice.id,
            title: `${choice.label} ${choice.priceAdjustment !== 0 ? formatNumber(choice.priceAdjustment) : ''}`,
          })),
        },
      }));

      let found = false;
      const updatedProducts = draft.upsellingProducts.map((i) => {
        if (!found && i.id === upSellingProduct.id && !i?.isOptionAdded) {
          found = true;
          return { ...i, isOptionAdded: true };
        }
        return i;
      });

      const updatedDraft: WorkflowDraft = {
        ...draft,
        upsellingProducts: updatedProducts,
        step: OrderFlowStep.UPSELLING_OPTIONS_ITEM_COLLECTION,
      };

      const productOptionsObject = productOptions?.reduce((acc, item) => ({ ...acc, ...item }), {});

      const flowContent = getFlowContent('product-option-flow', draft.lang);
      const enBodyText = `Please select the modifications for ${upSellingProduct.name}`;
      const arBodyText = `يرجى اختيار التعديلات الخاصة بـ ${upSellingProduct.name}`;
      draft.lang === 'en' ? (flowContent.bodyText = enBodyText) : (flowContent.bodyText = arBodyText);
      const res = await this.sendWhatSappProductOptionFlowInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
        flowId: flow?.type === 'flow' && (flow?.data.flowId as any),
        flowName: flow?.type === 'flow' && (flow?.data.flowName as any),
        productName: upSellingProduct.name,
        productOptions: productOptionsObject,
      });

      return {
        updatedDraft: updatedDraft,
        response: res,
      };
    }
    if (!upSellingProduct) {
      // send order summary
      return await this.processOrderSummaryHandler(draft, msg);
    }
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
      }
    } else {
      const flowContent = getFlowContent('choose-lang-flow', 'en');
      const res = await this.sendWhatSappSChooseLangInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
      });
      return {
        updatedDraft: null,
        response: res,
      };
    }
  }

  private async handleServiceSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    console.log('====================================');
    console.log('handleServiceSelection');
    console.log('====================================');
    if (msg?.interactive?.type === 'list_reply') {
      const listPayload = msg?.interactive?.list_reply as any;
      if (listPayload.id === 'item_1') {
        const updateDraft: WorkflowDraft = {
          ...draft,
          step: OrderFlowStep.ADDRESS_SELECTION,
          orderDetails: {
            ...(draft.orderDetails ?? {}),
            serviceType: 'takeaway',
          },
        };
        return await this.ProcessTakeawayHandler(updateDraft, msg);
      } else if (listPayload.id === 'item_2') {
        const updateDraft: WorkflowDraft = {
          ...draft,
          step: OrderFlowStep.ADDRESS_SELECTION,
          orderDetails: {
            ...(draft.orderDetails ?? {}),
            serviceType: 'delivery',
          },
        };
        return await this.ProcessDeliveryHandler(updateDraft, msg);
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
      }
    } else {
      const flowContent = getFlowContent('greeting-flow', draft.lang);
      const res = await this.sendWhatSappGreetingInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
      });
      return {
        updatedDraft: null,
        response: res,
      };
    }
  }

  private async handleAddressSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    console.log('====================================');
    console.log('handleAddressSelection');
    console.log('====================================');
    const payload = msg.interactive?.nfm_reply?.response_json
      ? JSON.parse(msg.interactive?.nfm_reply?.response_json as any)
      : null;

    if (payload?.zone_id || payload?.area_id) {
      const selectedArea = await AreaModel.findByPk(payload?.area_id);
      const shippingAddress = payload?.note;

      const updatedDraft: WorkflowDraft = {
        ...draft,
        orderDetails: {
          ...(draft.orderDetails ?? {}),
          deliveryAreaId: selectedArea!.id,
          branchId: selectedArea!.branchId,
          deliveryAreaName: selectedArea!.name,
          deliveryTime: getEstimatedTime(selectedArea!.deliveryTime) || '30mins',
          shippingAddress,
          serviceType: 'delivery',
          deliveryCharge: selectedArea!.deliveryCharge || 0,
        },
      };

      const catalog = await this.getCatalogLink();
      const flowContent = getFlowContent('catalog-flow', draft.lang);
      const res = await this.sendWhatSappCatalogInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
        ...catalog,
      });
      return {
        updatedDraft: { ...updatedDraft, step: OrderFlowStep.CATALOG_SELECTION },
        response: res,
      };
    } else if (payload?.branch_id) {
      const branch = await BranchesModel.findByPk(payload.branch_id);
      const updatedDraft: WorkflowDraft = {
        ...draft,
        orderDetails: {
          ...(draft.orderDetails ?? {}),
          branchId: branch!.id,
          branchName: branch!.name,
          deliveryTime: getEstimatedTime(branch!.takeAwayTime) || '30mins',
          serviceType: 'takeaway',
          deliveryCharge: 0,
        },
      };

      const catalog = await this.getCatalogLink();
      const flowContent = getFlowContent('catalog-flow', draft.lang);
      const res = await this.sendWhatSappCatalogInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
        ...catalog,
      });
      return {
        updatedDraft: { ...updatedDraft, step: OrderFlowStep.CATALOG_SELECTION },
        response: res,
      };
    } else {
      if (draft.orderDetails.serviceType === 'delivery') {
        return await this.ProcessDeliveryHandler(draft, msg);
      }

      if (draft.orderDetails.serviceType === 'takeaway') {
        return await this.ProcessTakeawayHandler(draft, msg);
      }
    }
  }

  private async handleCatalogSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    console.log('====================================');
    console.log('handleCatalogSelection');
    console.log('====================================');
    if (msg.type === 'order') {
      const items = msg.order?.product_items!;
      const products = items.flatMap((i) =>
        Array.from({ length: i.quantity }, () => ({
          id: i.product_retailer_id,
          quantity: 1,
        }))
      );

      const product_ids = products.map((p) => p.id);
      const selectedProducts = await ProductModel.findAll({
        where: {
          id: {
            [Op.in]: product_ids.filter(Boolean),
          },
          organizationId: this.organizationId,
        },
        include: [
          { model: ProductOptionModel, as: 'options', include: [{ model: ProductOptionChoiceModel, as: 'choices' }] },
        ],
      });

      // create lookup map
      const productMap = new Map(selectedProducts.map((p) => [p.id, p]));
      // rebuild with duplicates preserved
      const productsWithDuplicates = product_ids.map((id) => productMap.get(id));
      const productItems = productsWithDuplicates?.map((i: any) => ({
        productId: i.id,
        productName: i.name,
        price: i.price,
        quantity: 1,
      }));

      const updatedDraft: WorkflowDraft = {
        ...draft,
        step: OrderFlowStep.CUSTOMIZE_ORDER_SELECTION,
        selectedProducts: productsWithDuplicates as any,
        orderDetails: {
          ...draft.orderDetails,
          items: productItems as any,
        },
      };

      const flowContent = getFlowContent('customize-order-flow', draft.lang);
      const res = await this.sendWhatSappCustomizeOrderInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
      });
      return {
        updatedDraft: updatedDraft,
        response: res,
      };
    } else {
      const catalog = await this.getCatalogLink();
      const flowContent = getFlowContent('catalog-flow', draft.lang);
      const res = await this.sendWhatSappCatalogInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
        ...catalog,
      });
      return {
        updatedDraft: null,
        response: res,
      };
    }
  }

  private async handleCustomizeOrderSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    console.log('====================================');
    console.log('handleCustomizeOrderSelection');
    console.log('====================================');
    if (msg?.interactive?.type === 'button_reply') {
      const buttonPayload = msg?.interactive?.button_reply as any;
      if (buttonPayload.id === 'yes') {
        return await this.orderModificationHandler(draft, msg);
      }
      if (buttonPayload.id === 'no') {
        return await this.processUpsellingHandler(draft, msg);
      }
    } else {
      const flowContent = getFlowContent('customize-order-flow', draft.lang);
      const res = await this.sendWhatSappCustomizeOrderInteractiveMessage({
        recipientPhoneNumber: this.userPhoneNumber,
        ...flowContent,
      });
      return {
        updatedDraft: null,
        response: res,
      };
    }
  }

  private async handleOptionItemSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    console.log('====================================');
    console.log('handleOptionItemSelection');
    console.log('====================================');
    const payload = JSON.parse(msg.interactive?.nfm_reply?.response_json as any);
    if (payload.flowLabel === WhatsappFlowLabel.PRODUCT_OPTIONS_FLOW) {
      const optionNames = productOptionsTaxonomy.restaurant.map((i) => i.name);
      const flatIds = Object.keys(payload)
        .filter((key) => optionNames.includes(key))
        .flatMap((key) => (Array.isArray(payload[key]) ? payload[key] : [payload[key]]));

      const selectedProductOptionChoices = await ProductOptionChoiceModel.findAll({
        where: { id: flatIds },
        include: [
          {
            model: ProductOptionModel,
            as: 'productOption',
            attributes: ['id', 'name', 'description', 'isRequired', 'productId'],
          },
        ],
      });

      if (selectedProductOptionChoices.length > 0) {
        const productIds = draft.orderDetails.items.map((i) => i.productId);
        const optionChoices = selectedProductOptionChoices.filter((op: any) =>
          productIds.includes(op.productOption.productId)
        ) as any;

        const selectedOption = optionChoices?.map((ch: any) => ({
          optionId: ch.productOption.id,
          optionName: ch.productOption.name,
          choiceId: ch.id,
          choiceLabel: ch.label,
          priceAdjustment: ch.priceAdjustment || 0,
        }));

        const workingProductId = optionChoices[0].productOption.productId;
        draft.orderDetails.items.forEach((i) => {
          if (i.productId === workingProductId) {
            i.selectedOptions = selectedOption;
          }
        });
      }

      const updatedDraft: WorkflowDraft = {
        ...draft,
      };

      return await this.orderModificationHandler(updatedDraft, msg);
    }
    return await this.orderModificationHandler(draft, msg);
  }
  private async handleUpsellingSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    console.log('====================================');
    console.log('handleUpsellingSelection');
    console.log('====================================');
    const addItemToWorkflowDraft = async (upsellingItemIds: string[]) => {
      const itemIds = Array.isArray(upsellingItemIds) ? upsellingItemIds : [];

      const products =
        itemIds.length > 0
          ? await ProductModel.findAll({
              where: { id: itemIds },
              include: [
                {
                  model: ProductOptionModel,
                  as: 'options',
                  include: [{ model: ProductOptionChoiceModel, as: 'choices' }],
                },
              ],
            })
          : [];

      const productItems = products.map((i: any) => ({
        productId: i.id,
        productName: i.name,
        price: i.price,
        quantity: 1,
      }));

      const updatedDraft: WorkflowDraft = {
        ...draft,
        upsellingProducts: products as any,
        orderDetails: {
          ...draft.orderDetails,
          items: [...(draft.orderDetails.items || []), ...(productItems as any)],
        },
      };

      return updatedDraft;
    };
    let payload: any = null;

    if (msg?.interactive?.nfm_reply?.response_json) {
      payload = JSON.parse(msg.interactive.nfm_reply.response_json as any);
    }
    if (payload?.flowLabel === WhatsappFlowLabel.UPSELLING_ITEMS_FLOW) {
      // multi upselling
      const itemIds = Array.isArray(payload.item_id) ? payload.item_id : [];
      const updatedDraft = await addItemToWorkflowDraft(itemIds);
      return await this.upsellingProductOptionsHandler(updatedDraft, msg);
    } else if (msg?.interactive?.type === 'button_reply') {
      const buttonPayload = msg?.interactive?.button_reply as any;

      if (buttonPayload.id === 'yes') {
        console.log('================upsellingProducts====================');
        console.log(draft.upsellingProducts);
        console.log('====================================');
        // single upselling
        const upsellingItem = draft.upsellingProducts.map((i) => i.id);
        const updatedDraft = await addItemToWorkflowDraft(upsellingItem);

        return await this.upsellingProductOptionsHandler(updatedDraft, msg);
      }
      if (buttonPayload.id === 'no') {
        // send order summary
        return await this.processOrderSummaryHandler(draft, msg);
      }
    } else {
      return await this.upsellingProductOptionsHandler(draft, msg);
    }
  }
  private async handleUpsellingItemOptionSelection(draft: WorkflowDraft, msg: WhatsAppMessage) {
    console.log('====================================');
    console.log('handleUpsellingItemOptionSelection');
    console.log('====================================');
    const payload = JSON.parse(msg.interactive?.nfm_reply?.response_json as any);
    if (payload.flowLabel === WhatsappFlowLabel.PRODUCT_OPTIONS_FLOW) {
      const optionNames = productOptionsTaxonomy.restaurant.map((i) => i.name);
      const flatIds = Object.keys(payload)
        .filter((key) => optionNames.includes(key))
        .flatMap((key) => (Array.isArray(payload[key]) ? payload[key] : [payload[key]]));

      const selectedProductOptionChoices = await ProductOptionChoiceModel.findAll({
        where: { id: flatIds },
        include: [
          {
            model: ProductOptionModel,
            as: 'productOption',
            attributes: ['id', 'name', 'description', 'isRequired', 'productId'],
          },
        ],
      });

      if (selectedProductOptionChoices.length > 0) {
        const productIds = draft.orderDetails.items.map((i) => i.productId);
        const optionChoices = selectedProductOptionChoices.filter((op: any) =>
          productIds.includes(op.productOption.productId)
        ) as any;

        const selectedOption = optionChoices?.map((ch: any) => ({
          optionId: ch.productOption.id,
          optionName: ch.productOption.name,
          choiceId: ch.id,
          choiceLabel: ch.label,
          priceAdjustment: ch.priceAdjustment || 0,
        }));

        const workingProductId = optionChoices[0].productOption.productId;
        draft.orderDetails.items.forEach((i) => {
          if (i.productId === workingProductId) {
            i.selectedOptions = selectedOption;
          }
        });
      }

      const updatedDraft: WorkflowDraft = {
        ...draft,
      };
      return await this.upsellingProductOptionsHandler(updatedDraft, msg);
    }
    return await this.upsellingProductOptionsHandler(draft, msg);
  }
  private async handleOrderCompletion(draft: WorkflowDraft, msg: WhatsAppMessage) {
    try {
      if (msg?.interactive?.type === 'button_reply') {
        const buttonPayload = msg?.interactive?.button_reply as any;
        if (buttonPayload.id === 'confirm') {
          const enMessage = 'your order has being placed succesfully';
          const arMessage = 'تم تقديم طلبك بنجاح';
          const customer = await this.getCustomerData();
          draft.orderDetails.organizationId = customer.organizationId;
          draft.orderDetails.customerId = customer.id;
          console.log('================orderDetails====================');
          console.log(JSON.stringify(draft.orderDetails));
          console.log('====================================');
          await OrderModel.create(draft.orderDetails as any);
          const res = await this.sendWhatSappMessage({
            recipientPhoneNumber: this.userPhoneNumber,
            message: draft.lang === 'en' ? enMessage : arMessage,
          });
          await deleteMessageFromRedis(this.userPhoneNumber);
          return {
            updatedDraft: null,
            response: res,
          };
        } else if (buttonPayload.id === 'edit') {
          await this.sendWhatSappMessage({
            recipientPhoneNumber: this.userPhoneNumber,
            message: 'edit order is comming soon for now confirm or cancel your order',
          });

          // send order summary
          return await this.processOrderSummaryHandler(draft, msg);
        } else if (buttonPayload.id === 'cancel') {
          const enMessage = 'your order has being cancelled succesfully';
          const arMessage = 'تم إلغاء طلبك بنجاح';
          const res = await this.sendWhatSappMessage({
            recipientPhoneNumber: this.userPhoneNumber,
            message: draft.lang === 'en' ? enMessage : arMessage,
          });
          await deleteMessageFromRedis(this.userPhoneNumber);
          return {
            updatedDraft: null,
            response: res,
          };
        } else throw new Error('Wrong Button id for OrderSummary');
      } else {
        // send order summary
        return await this.processOrderSummaryHandler(draft, msg);
      }
    } catch (error: any) {
      console.error('handleOrderCompletion:', error.message);
      throw error;
    }
  }
}

interface workingProduct extends IProduct {
  isOptionAdded: boolean;
  options: ProductOption[];
}

export interface WorkflowDraft {
  phoneNumber: string;
  customerId: string;
  lang: 'en' | 'ar';
  step: `${OrderFlowStep}`;
  selectedProducts: workingProduct[];
  upsellingProducts: workingProduct[];
  orderDetails: {
    organizationId: string;
    customerId: string;
    branchId: string;
    branchName: string;
    currency: string;
    deliveryAreaId: string;
    deliveryAreaName: string;
    deliveryTime: string;
    shippingAddress: string;
    serviceType: 'delivery' | 'takeaway';
    subtotal: number;
    deliveryCharge: number;
    totalAmount: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      price: number;
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

interface SendWhatSappProductOptionsFlowProps extends FlowContent {
  recipientPhoneNumber: string;
  flowId: string;
  flowName?: string;
  productName: string;
  productOptions: any;
}

interface SendWhatSappMultiUpsellingProps extends FlowContent {
  recipientPhoneNumber: string;
  flowId: string;
  flowName?: string;
  items: { id: string; title: string }[];
}

interface SendWhatSappSingleUpsellingProps extends SingleUpsellingContent {
  recipientPhoneNumber: string;
}

interface SendWhatSappOrderSummaryProps extends OrderSummaryContent {
  recipientPhoneNumber: string;
}
