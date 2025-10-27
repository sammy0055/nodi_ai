import { BranchesModel } from '../models/branches.model';
import { WhatSappSettingsModel } from '../models/whatsapp-settings.model';
import { OrganizationsModel } from '../models/organizations.model';
import { UsersModel } from '../models/users.model';
import { IOrganization } from '../types/organization';
import { User } from '../types/users';
import { NotificationModel } from '../models/notification.model';
import { Sequelize } from 'sequelize';

export class OrganizationService {
  constructor() {}
  static async createOrganization(data: Omit<IOrganization, 'id'>, user: Pick<User, 'id'>) {
    const isOrganizationExist = await OrganizationsModel.findOne({ where: { ownerId: user.id } });
    if (isOrganizationExist) throw new Error('user already has an organization');
    const organization = await OrganizationsModel.create({ ...data, ownerId: user.id } as any);
    await UsersModel.update({ organizationId: organization.id }, { where: { id: user.id } });
    return organization;
  }

  static async updateOrganization(organizationId: string, data: IOrganization) {
    const [affectedCount, updatedRows] = await OrganizationsModel.update(data as any, {
      where: { id: organizationId },
      returning: true,
    });
    return updatedRows[0];
  }

  static async getOrganization(organizationId: string) {
    const org = await OrganizationsModel.findByPk(organizationId, {
      include: [
        {
          model: UsersModel,
          as: 'users',
        },
        {
          model: BranchesModel,
        },
        {
          model: WhatSappSettingsModel,
          as: 'whatsappsettings',
        },
        {
          model: NotificationModel,
          as: 'notifications',
        },
        {
          model: UsersModel,
          as: 'owner', // belongsTo (single object)
        },
      ],
    });
    if (!org) throw new Error('organization does not exist');
    return org;
  }
  static async getOrganizatonsStatitics() {
    const stats = await OrganizationsModel.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN status = 'active' THEN 1 ELSE 0 END`)), 'active'],
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END`)), 'cancelled'],
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN status = 'suspended' THEN 1 ELSE 0 END`)), 'suspended'],
      ],
      raw: true,
    });
    return stats[0];
  }
}
