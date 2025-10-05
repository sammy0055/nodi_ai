import { ChatHistoryManager } from '../services/ChatHistoryManager.service';
import { models } from '../models';
import { MCPChatBot } from './client';
import { createSystemPrompt } from './prompts';

const { CustomerModel, WhatSappSettingsModel, OrganizationsModel } = models;

export class ChatService extends MCPChatBot {
  protected organizationId: string = '';
  protected conversationId: string = '';
  protected userPhoneNumber: string;
  protected organizationWhatsappId: string;
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
    return instance;
  }

  private async getOrganization() {
    const org = await OrganizationsModel.findByPk(this.organizationId);
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
    const conversation = await chatHistory.getConversationsByCustomerId(customer.id);
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
    await this.connectToServer();
    const systemPrompt = createSystemPrompt({
      organizationData: planOrg!,
      customerData: customer,
      businessTone: 'formal',
      assistantName: 'Alex',
    });

    const conversation = await this.getAndCreateConversationIfNotExist(systemPrompt);
    const res = await this.process({
      query: userMessage,
      organizationId: this.organizationId,
      conversationId: conversation.id,
    });
    return res;
  }
}
