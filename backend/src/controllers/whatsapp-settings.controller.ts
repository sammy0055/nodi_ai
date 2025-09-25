import { WhatSappSettingsService } from '../services/whatapp-settings.service';
import { User } from '../types/users';
import { WhatSappAuthPayload } from '../types/whatsapp-settings';

export class WhatSappSettingsController {
  static getWhatSappAuthUrl() {
    return WhatSappSettingsService.getWhatSappAuthUrl();
  }
  static async exchangeWhatSappCodeForAccessTokens(data: WhatSappAuthPayload) {
    return await WhatSappSettingsService.exchangeWhatSappCodeForAccessTokens(data);
  }
  static async mockAddWhsappData(data: any, user: Pick<User, 'id' | 'organizationId'>) {
    return await WhatSappSettingsService.mockAddWhsappData(data, user);
  }
}
