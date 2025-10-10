import { ChatService } from '../mcp/ChatService';
import { MCPChatBot } from '../mcp/client';
import { IWhatSappSettings } from '../types/whatsapp-settings';
import { decrypt } from '../utils/crypto-utils';
import { run } from './migration';

const ddd = {
  whatsappBusinessId: '1390720013053482',
  whatsappPhoneNumberIds: ['752856747922018'],
  accessToken:
    '00f833afca1c9d39d33c64623b1c4690:6eefd6dc985ef942390d8005d34c07ada2a90e9c7d88e0fa87cc8e490c98ab51645186fe562e9a14148c6ba38e2897101b5042b5f1241522a4e01ce26b84128b1cb086732656738b8a40f0e817487ca4c052073a7d167743662ea4a64a47d694ef0c7016480fb15e2f9f0c3a50f1e2736252fd503ce9d7e0dc8cd026019f903951d1a45068671137377754b2a37acf89e16f976b9e8cd6ae79b4de5d3a4815c87f9de4dcac8c419fd54cfaaba4d6caffdaaba35d25e8e025ff612a59b65a353814860b0aa23465f0966c5236ab9deba2a476473e320e8b35a285b5923637a05477515581bd71f910690a8120425968e70bcd564b6abd4727fcd050e972ce8ba2079f1cdc245b21b813ad4d1b3412a95a604c7cacd0c08a4c6d04e574e320fac8',
  organizationId: '',
};
const testMcp = async (query: string) => {
  // const client = new MCPChatBot();
  const chat = new ChatService('', '');
  const accessToken = decrypt(ddd.accessToken);
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

const testwt = async () => {
  try {
    const accessToken = decrypt(ddd.accessToken);
    const response = await fetch(`https://graph.facebook.com/v19.0/${ddd.whatsappPhoneNumberIds[0]}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.error.message}`);
    }

    const data = await response.json();
    console.log('=================data===================');
    console.log(data);
    console.log('====================================');
  } catch (error: any) {
    console.log('===========mcp-rrrr-error==========');
    console.log(error);
    console.log('====================================');
  }
};

// testMcp('hello');
// run();
testwt();
