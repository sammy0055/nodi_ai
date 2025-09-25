import { appConfig } from '../config';
import { WhatSappConnectionStatus } from '../data/data-types';
import { WhatSappSettingsModel } from '../models/whatsapp-settings.model';
import { User } from '../types/users';
import { RegisterPhoneNumberArg, WhatSappAuthPayload } from '../types/whatsapp-settings';

export class WhatSappSettingsService {
  private static readonly MFAPIN = '886677';
  private static readonly meta_app_id = appConfig.whatsapp.appId;
  private static readonly meta_app_secret = appConfig.whatsapp.appSecret;
  private static readonly meta_app_whatsapp_cofigId = appConfig.whatsapp.authConfig;
  private static readonly meta_callback_url = appConfig.whatsapp.callbackUrl;
  constructor() {}
  static getWhatSappAuthUrl() {
    const urlParams = new URLSearchParams({
      client_id: this.meta_app_id,
      config_id: this.meta_app_whatsapp_cofigId,
      response_type: 'code',
      redirect_uri: this.meta_callback_url,
    });
    return {
      authUrl: `https://www.facebook.com/v18.0/dialog/oauth?${urlParams.toString()}`,
    };
  }
  static async exchangeWhatSappCodeForAccessTokens({
    code,
    whatsappBusinessId,
    whatsappPhoneNumberId,
    user,
  }: WhatSappAuthPayload) {
    const params = {
      client_id: this.meta_app_id,
      client_secret: this.meta_app_secret,
      grant_type: 'authorization_code',
      redirect_uri: this.meta_callback_url,
      code,
    };
    const encoded = new URLSearchParams(params);
    const url = `https://graph.facebook.com/v22.0/oauth/access_token?${encoded.toString()}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Error ${res.status}: ${errorData.error.message}`);
    }

    const data = (await res.json()) as { access_token: string; token_type: string };
    console.log(`✅------------accessToken successful:${data}`);

    const isSubscribedToWebhook = await this.subScribeWhatSappToWebHook({
      whatsappBusinessId: whatsappBusinessId,
      accessToken: data.access_token,
      whatsappPhoneNumberId,
    });
    console.log(`✅------------SubscribedToWebhook successful:${isSubscribedToWebhook}`);
    const registeredNumber = await this.registerPhoneNumber({
      whatsappBusinessId: whatsappBusinessId,
      accessToken: data.access_token,
      whatsappPhoneNumberId,
    });
    console.log(`✅------------registeredNumber successful:${registeredNumber}`);
    if (!user.organizationId) throw new Error('you need to have an organization first');
    const payload = {
      organizationId: user.organizationId,
      whatsappBusinessId: whatsappBusinessId,
      whatsappPhoneNumberIds: [whatsappPhoneNumberId],
      connectionStatus: WhatSappConnectionStatus.Connected,
      accessToken: data.access_token,
      token_type: data.token_type,
      isSubscribedToWebhook: isSubscribedToWebhook ? true : false,
    };

    const whatBussinessAccountData = await WhatSappSettingsModel.create(payload);
    console.log('====whatBussinessAccountData=========');
    console.log(payload);
    console.log('====================================');
    return whatBussinessAccountData;
  }

  static async subScribeWhatSappToWebHook({ whatsappBusinessId, accessToken }: RegisterPhoneNumberArg) {
    const url = `https://graph.facebook.com/v23.0/${whatsappBusinessId}/subscribed_apps`;
    const wabaRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        pin: this.MFAPIN,
      }),
    });

    if (!wabaRes.ok) {
      const errorData = await wabaRes.json();
      throw new Error(`Error ${wabaRes.status}: ${errorData.error.message}`);
    }

    return await wabaRes.json();
  }

  static async registerPhoneNumber({ accessToken, whatsappPhoneNumberId }: RegisterPhoneNumberArg) {
    // const url = `https://graph.facebook.com/v20.0/${whatsappBusinessId}/phone_numbers`;
    // const res = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    // });

    // if (!res.ok) {
    //   const errorData = await res.json();
    //   throw new Error(`Error ${res.status}: ${errorData.error.message}`);
    // }

    // const phoneNumbers = (await res.json()) as { data: WhatsAppBusinessAccountPhoneNumber[] };
    // if (phoneNumbers.data.length === 0) throw new Error('No phone number was found in your WhatsApp account');
    // const phoneNumber = phoneNumbers.data[0];

    const registrationUrl = `https://graph.facebook.com/v20.0/${whatsappPhoneNumberId}/register`;
    const resRegister = await fetch(registrationUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        pin: this.MFAPIN,
      }),
    });

    if (!resRegister.ok) {
      const errorData = await resRegister.json();
      throw new Error(`Error ${resRegister.status}: ${errorData.error.message}`);
    }
    return whatsappPhoneNumberId;
  }

  static async mockAddWhsappData(data: any, user: Pick<User, 'id' | 'organizationId'>) {
    return await WhatSappSettingsModel.create({ ...data, organizationId: user.organizationId });
  }
}

// const url = 'https://graph.facebook.com/v22.0/oauth/access_token';
// const response = await fetch(url, {
//   method: 'POST',
//   body: JSON.stringify({
//     client_id: '2512895449065253',
//     client_secret: '********************************',
//     grant_type: 'authorization_code',
//     redirect_uri:
//       'https://developers.facebook.com/es/oauth/callback/?use_case_enum=WHATSAPP_BUSINESS_MESSAGING&selected_tab=wa-dev-quickstart&product_route=whatsapp-business&business_id=213148529184583&nonce=iKl2bOgqmZ0PGeXCHYLDgYyQMsjKTW46',
//   }),
//   headers: { 'Content-Type': 'application/json' },
// });
// const data = await response.json();
// console.log(data);
