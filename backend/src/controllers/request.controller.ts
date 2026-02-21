import { RelatedEntityType } from '../data/data-types';
import { RequestService } from '../services/request.service';
import { Pagination } from '../types/common-types';
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
    static async rejectRequest(requestData: RequestAttributes, user: Pick<AdminUser, 'id' | 'email' | 'type'>) {
    return await RequestService.rejectRequest(requestData, user);
  }
  static async getRequests(filters: { status: string }, { offset, limit, page }: Pagination) {
    return await RequestService.getRequests(filters, { offset, limit, page });
  }

  static async getRequest(user: Pick<User, 'id' | 'organizationId'>, requestType: `${RelatedEntityType}`) {
    return await RequestService.getRequest(user, requestType);
  }
}
