import { FlowContent, getFlowContent } from '../../data/flow-static-data';
import { models } from '../../models';
import { WhatsappFlowLabel } from '../../types/whatsapp-settings';
import { WhatsAppMessage } from '../../types/whatsapp-webhook';
import { mapToReviewQuestions } from '../../utils/common-fn';

export interface ReviewQuestions {
  q1_id: string;
  q1_text: string;

  q2_id: string;
  q2_text: string;

  q3_id: string;
  q3_text: string;

  show_q1: boolean;
  show_q2: boolean;
  show_q3: boolean;
}
interface SendWhatSappReviewProps extends FlowContent {
  recipientPhoneNumber: string;
  flowId: string;
  flowName: string;
  questions: ReviewQuestions;
}

const { WhatSappSettingsModel, OrganizationsModel, CustomerModel } = models;
export const sendReviewMessageForMalekAI = async (
  whatsappBusinessId: string,
  msg: WhatsAppMessage,
  { orderId, customerId }: { orderId: string; customerId: string }
) => {
  try {
    const whatsappSettings = await WhatSappSettingsModel.findOne({ where: { whatsappBusinessId } });
    if (!whatsappSettings) throw new Error(`"no whatsapp record for this WABA:" ${whatsappBusinessId}`);

    const flow = whatsappSettings?.whatsappTemplates.find(
      (w) => w.type === 'flow' && w.data?.flowLabel === WhatsappFlowLabel.Review_Order
    );

    const org = await OrganizationsModel.findByPk(whatsappSettings.organizationId!);
    if (!org) throw new Error(`"no whatsapp record for this WABA:" ${whatsappBusinessId}`);
    if (org.reviewQuestions.length < 1) return;
    const customer = await CustomerModel.findByPk(customerId);
    const qs = mapToReviewQuestions(org.reviewQuestions);
    const flowContent = getFlowContent('review-flow', customer?.lang || 'en');
    const args: SendWhatSappReviewProps = {
      recipientPhoneNumber: msg.from,
      ...flowContent,
      flowId: flow?.type === 'flow' && (flow?.data.flowId as any),
      flowName: flow?.type === 'flow' && (flow?.data.flowName as any),
      questions: qs,
    };

    const reviewFlowBody = {
      messaging_product: 'whatsapp',
      to: args.recipientPhoneNumber,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: args.headingText,
        },
        body: {
          text: args.bodyText,
        },
        footer: {
          text: args.footerText,
        },
        action: {
          name: 'flow',
          parameters: {
            flow_id: args.flowId,
            flow_message_version: '3',
            flow_cta: args.buttonText,
            mode: 'published',
            flow_action: 'navigate',
            flow_action_payload: {
              screen: 'DYNAMIC_SURVEY',
              data: JSON.stringify({
                status: 'active',
                ...args.questions,
                flowLabel: WhatsappFlowLabel.Review_Order,
                orderId: orderId,
              }),
            },
          },
        },
      },
    };

    const url = `https://graph.facebook.com/v20.0/${whatsappSettings.whatsappPhoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.META_BUSINESS_SYSTEM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewFlowBody),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Error ${res.status}: ${errorData.error.message}`);
    }
  } catch (error: any) {
    console.error('sendReviewMessageForMalekAI:', error.message);
  }
};
