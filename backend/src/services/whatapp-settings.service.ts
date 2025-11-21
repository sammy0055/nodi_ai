import { appConfig } from '../config';
import { WhatSappConnectionStatus } from '../data/data-types';
import { templates } from '../data/templates';
import { OrganizationsModel } from '../models/organizations.model';
import { WhatSappSettingsModel } from '../models/whatsapp-settings.model';
import { User } from '../types/users';
import {
  createWhatsappFlowArgs,
  IWhatSappSettings,
  RegisterPhoneNumberArg,
  WhatSappAuthPayload,
  WhatsAppPhoneNumberInfo,
} from '../types/whatsapp-settings';

export class WhatSappSettingsService {
  private static readonly MFAPIN = '886677';
  private static readonly MetaBaseUrl = 'https://graph.facebook.com/v20.0';
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
      // redirect_uri: this.meta_callback_url,
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
    data.access_token = appConfig.metaBusinessToken;
    console.log(`✅------------accessToken successful:${data}`);

    const isSubscribedToWebhook = await this.subScribeWhatSappToWebHook({
      whatsappBusinessId: whatsappBusinessId,
      accessToken: data.access_token,
      whatsappPhoneNumberId,
    });
    console.log(`✅------------SubscribedToWebhook successful:${isSubscribedToWebhook}`);

    const phoneNumberInfo = await this.inspectPhoneNumber({
      whatsappBusinessId: whatsappBusinessId,
      accessToken: data.access_token,
      whatsappPhoneNumberId,
    });

    // if (this.isPhoneNumberRegistered(phoneNumberInfo)) {
    //   const deregisterPayload = await this.deregisterPhoneNumber({
    //     whatsappBusinessId: whatsappBusinessId,
    //     accessToken: data.access_token,
    //     whatsappPhoneNumberId,
    //   });
    //   console.log(`✅------------deregisted Number successful:${JSON.stringify(deregisterPayload, null, 2)}`);
    // }

    const registeredNumber = await this.registerPhoneNumber({
      whatsappBusinessId: whatsappBusinessId,
      accessToken: data.access_token,
      whatsappPhoneNumberId,
    });

    console.log(`✅------------registeredNumber successful:${JSON.stringify(registeredNumber, null, 2)}`);

    const uploadedPublicKeyToPhoneNumber = await this.uploadPublicKeyToPhoneNumber({
      whatsappPhoneNumberId,
      whatsappBusinessId,
      accessToken: data.access_token,
    });
    console.log(
      `✅------------uploadedPublicKeyToPhoneNumber successfully:${JSON.stringify(uploadedPublicKeyToPhoneNumber, null, 2)}`
    );

    const areaAndZoneFlow = await this.createWhsappFlow({
      whatsappBusinessId,
      accessToken: data.access_token,
      flowName: 'ZONE_AND_AREAS_FLOW',
      flowJson: JSON.stringify(templates.whatsappFlow.zoneAndAreaFlow),
      flowEndpoint: 'https://labanon.naetechween.com/api/whatsappflow/flow-endpoint',
    });

    console.log(`✅------------create AreaAndZoneFlow Draft successfully:${JSON.stringify(areaAndZoneFlow, null, 2)}`);
    if (!user.organizationId) throw new Error('you need to have an organization first');
    const payload: IWhatSappSettings = {
      organizationId: user.organizationId,
      whatsappBusinessId: whatsappBusinessId,
      whatsappPhoneNumberId: whatsappPhoneNumberId,
      whatsappPhoneNumber: phoneNumberInfo.display_phone_number,
      connectionStatus: WhatSappConnectionStatus.Pending,
      accessToken: data.access_token,
      token_type: data.token_type,
      isSubscribedToWebhook: isSubscribedToWebhook ? true : false,
      whatsappTemplates: [
        {
          type: 'flow',
          isPublished: false,
          data: { flowId: areaAndZoneFlow.flowID, flowName: areaAndZoneFlow.flowName },
        },
      ],
    };

    const whatBussinessAccountData = await WhatSappSettingsModel.create(payload);
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
    const registrationUrl = `https://graph.facebook.com/v24.0/${whatsappPhoneNumberId}/register`;
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

  static async deregisterPhoneNumber({ accessToken, whatsappPhoneNumberId }: RegisterPhoneNumberArg) {
    const deregisterUrl = `https://graph.facebook.com/v24.0/${whatsappPhoneNumberId}/deregister`;

    const resRegister = await fetch(deregisterUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!resRegister.ok) {
      const errorData = await resRegister.json();
      throw new Error(`Error ${resRegister.status}: ${errorData.error.message}`);
    }
    return whatsappPhoneNumberId;
  }

  static async inspectPhoneNumber({ accessToken, whatsappPhoneNumberId }: RegisterPhoneNumberArg) {
    const response = await fetch(`https://graph.facebook.com/v19.0/${whatsappPhoneNumberId}`, {
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
    console.log('====WhatsAppPhoneNumberInfo=========');
    console.log(data);
    console.log('====================================');
    return data as WhatsAppPhoneNumberInfo;
  }

  static async uploadPublicKeyToPhoneNumber({ accessToken, whatsappPhoneNumberId }: RegisterPhoneNumberArg) {
    const url = `https://graph.facebook.com/v24.0/${whatsappPhoneNumberId}/whatsapp_business_encryption`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        business_public_key: process.env.WHATSAPPP_FLOW_AES_PUBLIC_KEY!,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('=========upload AES public key failed==========');
      console.log('📛', JSON.stringify(errorData, null, 2));
      console.log('====================================');
      throw new Error(`Error ${response.status}: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data;
  }

  static async createWhsappFlow({
    whatsappBusinessId,
    accessToken,
    flowName,
    flowJson: _flowJson,
    flowEndpoint,
  }: createWhatsappFlowArgs) {
    const flowJson = {
      name: flowName,
      categories: ['OTHER'],
      flow_json: _flowJson,
      publish: false,
      ...(flowEndpoint && { endpoint_uri: flowEndpoint }),
    };

    const url = `https://graph.facebook.com/v20.0/${whatsappBusinessId}/flows`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flowJson),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('====================================');
      console.log('📛', JSON.stringify(errorData, null, 2));
      console.log('====================================');
      throw new Error(`Error ${response.status}: ${errorData.error.message}`);
    }

    const data = await response.json();
    return {
      flowID: data.id,
      flowName,
    };
  }

  static async publishWhatsappFlows(user: Pick<User, 'organizationId'>) {
    if (!user.organizationId) throw new Error('organization id is required to publish template flows');
    const org = await WhatSappSettingsModel.findOne({ where: { organizationId: user.organizationId } });
    if (!org) throw new Error('organization does not exist');
    const templates = org.whatsappTemplates;
    const unpublishedFlows = templates.filter((t) => t.type === 'flow' && t.isPublished === false);
    if (unpublishedFlows.length === 0) throw new Error('no pre-built template flow to publish');

    for (const flows of unpublishedFlows) {
      if (flows.type !== 'flow') return;
      const url = `${this.MetaBaseUrl}/${flows.data.flowId}/publish`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.META_BUSINESS_SYSTEM_TOKEN}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('====================================');
        console.log('📛', JSON.stringify(errorData, null, 2));
        console.log('====================================');
        throw new Error(`Error ${response.status}: ${errorData.error.message}`);
      }

      templates.forEach((t) => {
        if (t.type === 'flow') {
          if (t.data.flowId === flows.data.flowId) {
            t.isPublished = true;
          }
        }
      });

      await WhatSappSettingsModel.update(
        { whatsappTemplates: templates },
        { where: { organizationId: user.organizationId } }
      );
    }

    const updatedWhatsappSettings = await WhatSappSettingsModel.findOne({
      where: { organizationId: user.organizationId },
    });
    return updatedWhatsappSettings;
  }

  static isPhoneNumberRegistered(phoneNumberInfo: WhatsAppPhoneNumberInfo) {
    return phoneNumberInfo.throughput.level === 'STANDARD';
  }

  static async mockAddWhsappData(data: any, user: Pick<User, 'id' | 'organizationId'>) {
    return await WhatSappSettingsModel.create({ ...data, organizationId: user.organizationId });
  }
}
