import { RelatedEntityType, RequestStatus } from '../data/data-types';
import { OrganizationsModel } from '../models/organizations.model';
import { RequestModel } from '../models/request.module';
import { WhatSappSettingsModel } from '../models/whatsapp-settings.model';
import { Pagination } from '../types/common-types';
import { RequestAttributes } from '../types/notification';
import { AdminUser, User } from '../types/users';
import { IWhatSappSettings } from '../types/whatsapp-settings';

export class RequestService {
  static async createRequest(requestData: RequestAttributes, user: Pick<User, 'id' | 'organizationId'>) {
    if (requestData.requestType === 'CatalogRequest') {
      const whatsappData = await WhatSappSettingsModel.findOne({ where: { organizationId: user.organizationId } });

      if (!whatsappData) throw new Error('no whatsapp business account found');
      const org = await OrganizationsModel.findByPk(user.organizationId!);
      const data = await RequestModel.create({
        ...requestData,
        organizationId: user.organizationId!,
        requesterUserId: user.id,
        data: {
          organizationName: org?.name,
          organizationId: user.organizationId!,
          whatsappBusinessId: whatsappData.whatsappBusinessId,
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

  static async updateOrganizationWABA(
    data: Pick<IWhatSappSettings, 'organizationId' | 'whatsappBusinessId' | 'catalogId'>,
    user: Pick<AdminUser, 'id' | 'type'>
  ) {
    if (user.type !== 'admin') throw new Error('Unauthorized');

    await WhatSappSettingsModel.update(
      { catalogId: data.catalogId },
      { where: { organizationId: data.organizationId, whatsappBusinessId: data.whatsappBusinessId } }
    );
  }

  static async getRequests(filters: { status: string }, { offset, limit, page }: Pagination) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    const { rows: requests, count: totalItemsRaw } = await RequestModel.findAndCountAll({
      where,
      offset,
      limit,
    });

    // totalItems from Sequelize can be number or object depending on dialect; ensure numeric
    const totalItems = typeof totalItemsRaw === 'number' ? totalItemsRaw : (totalItemsRaw as any).count || 0;
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
    return {
      data: requests,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getRequest(user: Pick<User, 'id' | 'organizationId'>, requestType: `${RelatedEntityType}`) {
    if (!Object.values(RelatedEntityType).includes(requestType as any)) throw new Error('wrong request type selected');
    return await RequestModel.findOne({ where: { organizationId: user.organizationId!, requestType: requestType } });
  }
}
