// ===== CREDIT BILLING CALCULATOR =====

import { Conversation } from '../models/conversation.model';
import { CreditBalanceModel } from '../models/creditBalance.model';
import { SubscriptionsModel } from '../models/subscriptions.model';
import { UsageRecordModel } from '../models/usage-records.model';
import { creditFeatureName } from '../types/usage-record';

// free trial
const isFreeTrialActive = true;

export interface CreditUsageAttributes {
  aiTokensUsed: number;
  catalogCalls: number;
}
interface OrganizationAttributes {
  organizationId: string;
  conversationId?: string;
}

export const validateSubscriptionStatus = async (organizationId: string) => {
  if (!isFreeTrialActive) {
    const sub = await SubscriptionsModel.findOne({ where: { organizationId: organizationId } });
    if (sub?.status !== 'active') throw new Error(`subscription expired for organizationId: ${organizationId}`);
  }
  return true;
};

export const calculateAndSubtractCredits = async (
  args: Partial<CreditUsageAttributes>,
  org: OrganizationAttributes
) => {
  const isFreeTrial = await validateSubscriptionStatus(org.organizationId);
  if (isFreeTrial) return;
  const { aiTokensUsed, catalogCalls } = args;
  const aitoken_per_credit = 1000;
  const catalogApiCall_per_credit = 5;
  const whatsappConvWindow_per_credit = 1; // in 24hrs window

  // Convert usage to credits
  const aiCredits = aiTokensUsed ? Math.ceil(aiTokensUsed / aitoken_per_credit) : 0;
  const catalogCredits = catalogCalls ? Math.ceil(catalogCalls / catalogApiCall_per_credit) : 0;
  let whatsappCredits = 0;

  if (org.conversationId) {
    const conv = await Conversation.findByPk(org.conversationId);
    if (!conv) throw new Error('Credit: conversation does not exist');
    const lastUpdated = new Date(conv.updated_at).getTime();
    const now = Date.now();
    const diffHours = (now - lastUpdated) / (1000 * 60 * 60);

    if (diffHours >= 24) {
      // 24 hours or more since last update
      whatsappCredits = whatsappConvWindow_per_credit;
    }
  }
  const totalCreditsUsed = aiCredits + whatsappCredits + catalogCredits;
  const creditUsed = Number(totalCreditsUsed.toFixed(2));

  const creditRecords = await CreditBalanceModel.findOne({ where: { organizationId: org.organizationId } });
  if (!creditRecords) throw new Error('Credit: no credit for organization:' + org.conversationId);

  if (creditRecords.totalCredits <= creditUsed) {
    await SubscriptionsModel.update({ status: 'cancelled' }, { where: { organizationId: org.organizationId } });
    // send email notification to organization
    //   disable webhook subscription for whatsapp
    console.warn('====================================');
    console.warn('subscription cancelled for organization:' + org.organizationId);
    console.warn('====================================');
    return;
  }

  await CreditBalanceModel.update(
    {
      usedCredits: creditRecords.usedCredits + creditUsed,
      remainingCredits: creditRecords.remainingCredits - creditUsed,
    },
    { where: { organizationId: org.organizationId } }
  );
  await UsageRecordModel.update(
    { featureName: creditFeatureName.All, creditsConsumed: creditUsed },
    { where: { organizationId: org.conversationId } }
  );
};
