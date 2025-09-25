import { RequestStatus } from '../data/data-types';
import { RequestModel } from '../models/request.module';
import { WhatSappSettingsModel } from '../models/whatsapp-settings.model';
import { RequestAttributes } from '../types/notification';
import { AdminUser, User } from '../types/users';

export class RequestService {
  static async createRequest(requestData: RequestAttributes, user: Pick<User, 'id' | 'organizationId'>) {
    if (requestData.requestType === 'CatalogRequest') {
      const whatsappData = await WhatSappSettingsModel.findOne({ where: { organizationId: user.organizationId } });
      if (!whatsappData) throw new Error('no whatsapp business account found');
      const data = await RequestModel.create({
        ...requestData,
        organizationId: user.organizationId!,
        requesterUserId: user.id,
        data: {
          whatsappBusinessId: whatsappData.id,
        },
      });
      //   send notification
      return data;
    } else {
      const data = await RequestModel.create({
        ...requestData,
        organizationId: user.organizationId!,
        requesterUserId: user.id,
      });
      //   send notification
      return data;
    }
  }

  static async approveRequest(requestData: RequestAttributes, user: Pick<AdminUser, 'id' | 'email' | 'type'>) {
    if (user.type !== 'admin') throw new Error('Unauthorized');
    await RequestModel.update(
      {
        status: RequestStatus.APPROVED,
        approvalNotes: requestData.approvalNotes,
        approvedByUserId: user.id,
        approvedAt: requestData.approvedAt,
        rejectedAt: requestData.rejectedAt,
        data: requestData.data,
      },
      { where: { id: requestData.id } }
    );
  }

  static async getRequest() {
    return await RequestModel.findAll({ where: { status: RequestStatus.PENDING } });
  }
}
