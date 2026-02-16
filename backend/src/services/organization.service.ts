import { BranchesModel } from '../models/branches.model';
import { WhatSappSettingsModel } from '../models/whatsapp-settings.model';
import { OrganizationsModel } from '../models/organizations.model';
import { UsersModel } from '../models/users.model';
import { IOrganization, OrgReviewQuestions, ServiceSchedule } from '../types/organization';
import { User } from '../types/users';
import { NotificationModel } from '../models/notification.model';
import { literal, Op, Sequelize } from 'sequelize';
import { Pagination } from '../types/common-types';
import { SubscriptionsModel } from '../models/subscriptions.model';
import { SubscriptionPlanModel } from '../models/subscription-plan.model';
import { CreditBalanceModel } from '../models/creditBalance.model';
import { roleService } from './role.service';
import { UserTypes } from '../data/data-types';
import { sequelize } from '../models/db';

export class OrganizationService {
  constructor() {}
  static async createOrganization(data: Omit<IOrganization, 'id'>, user: Pick<User, 'id'>) {
    return await sequelize.transaction(async (t) => {
      const isOrganizationExist = await OrganizationsModel.findOne({
        where: { ownerId: user.id },
        transaction: t,
      });

      if (isOrganizationExist) throw new Error('user already has an organization');
      const organization = await OrganizationsModel.create({ ...data, ownerId: user.id } as any, { transaction: t });

      const adminUser = await UsersModel.findByPk(user.id, { transaction: t });
      if (!adminUser) throw new Error('the user does not exist');

      await adminUser.update({ organizationId: organization.id }, { transaction: t });
      const createdRoles = await roleService.createBulkRole(
        organization.id,
        t // pass transaction down
      );

      const adminRole = createdRoles.find((r) => r.name === UserTypes.SuperAdmin);
      if (!adminRole) throw new Error('super admin role needs to exist');

      await adminUser.setRoles([adminRole], { transaction: t });
      return organization;
    });
  }

  static async updateOrganization(organizationId: string, data: IOrganization) {
    const [affectedCount, updatedRows] = await OrganizationsModel.update(data as any, {
      where: { id: organizationId },
      individualHooks: true,
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
    const { total, ...rest } = stats[0] as any;
    return {
      total: total,
      status: {
        ...rest,
      },
    };
  }

  static async getOrganizationForAdmin({ offset, limit, page }: Pagination, searchQuery: string) {
    const where: any = {};
    // only add search when there’s text
    if (searchQuery && searchQuery.trim() !== '') {
      where[Op.and] = literal(`
    to_tsvector(
      'english',
      coalesce(("Organizations"."id")::text, '') || ' ' ||
      coalesce("Organizations"."name", '')
    )
    @@ plainto_tsquery('english', ${OrganizationsModel.sequelize!.escape(searchQuery)})
  `);
    }
    const { rows: orgs, count: totalItemsRaw } = await OrganizationsModel.findAndCountAll({
      where,
      distinct: true, // <-- important to avoid duplicate-count from joins
      col: 'id', // optional: ensures count works on primary key
      order: [
        [
          literal(`
        ts_rank(
          to_tsvector(
            'english',
            coalesce(("Organizations"."id")::text, '') || ' ' ||
            coalesce("Organizations"."name", '')
          ),
          plainto_tsquery('english', ${OrganizationsModel.sequelize!.escape(searchQuery)})
        )
      `),
          'DESC',
        ],
      ],
      offset,
      limit,
      include: [
        { model: SubscriptionsModel, as: 'subscription', include: [{ model: SubscriptionPlanModel, as: 'plan' }] },
        { model: CreditBalanceModel, as: 'creditBalance' },
      ],
    });

    // totalItems from Sequelize can be number or object depending on dialect; ensure numeric
    const totalItems = typeof totalItemsRaw === 'number' ? totalItemsRaw : (totalItemsRaw as any).count || 0;

    // compute totalPages and clamp current page to a sensible value
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
    return {
      data: orgs,
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

  static async updateOrganizationStatusForAdmin(org: Pick<IOrganization, 'status' | 'id'>) {
    if (!org.id || !org.status) throw new Error('payload is missing');
    await OrganizationsModel.update({ status: org.status }, { where: { id: org.id } });
  }

  static async setOrgReviewQuestions(data: OrgReviewQuestions[], user: Pick<User, 'id' | 'organizationId'>) {
    const [_, updatedOrg] = await OrganizationsModel.update(
      { reviewQuestions: data },
      { where: { id: user.organizationId! }, returning: true, individualHooks: true }
    );
    const plainOrg = updatedOrg[0].get({ plain: true });
    return plainOrg;
  }

  static async setOrgFQAQuestions(data: OrgReviewQuestions[], user: Pick<User, 'id' | 'organizationId'>) {
    const [_, updatedOrg] = await OrganizationsModel.update(
      { frequentlyAskedQuestions: data },
      { where: { id: user.organizationId! }, returning: true, individualHooks: true }
    );
    const plainOrg = updatedOrg[0].get({ plain: true });
    return plainOrg;
  }

  static async setServiceSchedule(
    data: { serviceSchedules: ServiceSchedule[]; timeZone: string },
    user: Pick<User, 'id' | 'organizationId'>
  ) {
    const [_, updatedOrg] = await OrganizationsModel.update(
      { serviceSchedule: data.serviceSchedules, timeZone: data.timeZone },
      { where: { id: user.organizationId! }, returning: true, individualHooks: true }
    );

    const plainOrg = updatedOrg[0].get({ plain: true });
    return plainOrg;
  }

  static async setOrgReviewTimer(timer: number, user: Pick<User, 'id' | 'organizationId'>) {
    if (!timer) throw new Error('reviewTimer is required');

    const [_, updatedOrg] = await OrganizationsModel.update(
      { reviewTimer: timer },
      { where: { id: user.organizationId! }, returning: true, individualHooks: true }
    );
    const plainOrg = updatedOrg[0].get({ plain: true });
    return plainOrg;
  }
}
