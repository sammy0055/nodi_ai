import { RelatedEntityType } from '../data/data-types';
import { RequestService } from '../services/request.service';
import { RequestAttributes } from '../types/notification';
import { AdminUser, User } from '../types/users';
import { IWhatSappSettings } from '../types/whatsapp-settings';

export class RequestController {
  static async createRequest(requestData: RequestAttributes, user: Pick<User, 'id' | 'organizationId'>) {
    return await RequestService.createRequest(requestData, user);
  }

  static async updateOrganizationWABA(
    data: Pick<IWhatSappSettings, 'organizationId' | 'whatsappBusinessId' | 'catalogId'>,
    user: Pick<AdminUser, 'id' | 'type'>
  ) {
    await RequestService.updateOrganizationWABA(data, user);
  }

  static async approveRequest(requestData: RequestAttributes, user: Pick<AdminUser, 'id' | 'email' | 'type'>) {
    return await RequestService.approveRequest(requestData, user);
  }
  static async getRequests() {
    return await RequestService.getRequests();
  }

  static async getRequest(user: Pick<User, 'id' | 'organizationId'>, requestType: `${RelatedEntityType}`) {
    return await RequestService.getRequest(user, requestType);
  }
}
