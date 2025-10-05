import { ChatService } from '../mcp/ChatService';
import { MCPChatBot } from '../mcp/client';
import { IWhatSappSettings } from '../types/whatsapp-settings';
import { decrypt } from '../utils/crypto-utils';
import { run } from './migration';

const ddd = {
  whatsappBusinessId: '800165909091155',
  whatsappPhoneNumberIds: ['836394619552231'],
  accessToken:
    '',
  organizationId: '',
};
const testMcp = async (query: string) => {
  // const client = new MCPChatBot();
  const chat = new ChatService('', '');
  const accessToken = decrypt(ddd.accessToken)
  try {
    await chat.sendWhatSappMessage({
      access_token: accessToken,
      WhatSappBusinessPhoneNumberId: ddd.whatsappPhoneNumberIds[0],
      recipientPhoneNumber: '+2348171727284',
    });
  } catch (error: any) {
    console.log('===========mcp-rrrr-error==========');
    console.log(error);
    console.log('====================================');
  }
};

// testMcp('hello');
// run();
