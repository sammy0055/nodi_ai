import { Op, Transaction } from 'sequelize';
import { UserTypes } from '../data/data-types';
import { UserPermissionsModel } from '../models/permission.model';
import { UserRoleModel } from '../models/role.model';
import { User } from '../types/users';

export class roleService {
  constructor() {}

  static async createRole(role: `${UserTypes}`, user: Pick<User, 'id'>) {
    return await UserRoleModel.create({ name: role });
  }

  static async createBulkRole(organizationId: string, transaction?: Transaction) {
    if (!organizationId) throw new Error('organizationId is required');
    const roles = [
      {
        name: UserTypes.Admin,
        description: 'manage staff, manager users and the entire application',
        organizationId,
      },
      {
        name: UserTypes.Staff,
        description: 'manage products and orders',
        organizationId,
      },
      {
        name: UserTypes.Manager,
        description: 'manage products, inventories, branches and orders',
        organizationId,
      },
      {
        name: UserTypes.SuperAdmin,
        description: 'owner of the application',
        organizationId,
      },
    ];
    return await UserRoleModel.bulkCreate(roles, { transaction });
  }

  static async updateRole(
    role: { id: string; name: string; description: string },
    user: Pick<User, 'id' | 'organizationId'>
  ) {
    if (!user.organizationId) throw new Error('organizationId is required to update a role');
    if (!role.id) throw new Error('role id is required');
    const oldRole = await UserRoleModel.findByPk(role.id);
    if (!oldRole) throw new Error('role does not exist is required');
    if (oldRole.name === UserTypes.SuperAdmin) throw new Error("super-admin role can't be edited");
    if (!Object.values(UserTypes).includes(role.name as UserTypes)) throw new Error('role name is not supported');
    const [_, updatedRole] = await UserRoleModel.update(role, {
      where: { id: role.id, organizationId: user.organizationId },
      returning: true,
    });
    return updatedRole[0].get({ plain: true }); // plain JS object
  }

  static async getRoles(user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.organizationId) throw new Error('organizationId is required to get roles');
    return await UserRoleModel.findAll({
      where: {
        name: {
          [Op.ne]: 'super-admin',
        },

        organizationId: user.organizationId,
      },
      include: {
        model: UserPermissionsModel,
        as: 'permissions',
      },
    });
  }

  static async removeRole(id: string, user: Pick<User, 'id' | 'organizationId'>) {
    await UserRoleModel.destroy({ where: { id: id, organizationId: user.organizationId } });
  }

  static async addPermissionsToRole(
    args: { permIds: string[]; role: `${UserTypes}` },
    user: Pick<User, 'id' | 'organizationId'>
  ) {
    if (!args.permIds || args.permIds.length === 0) throw new Error('permission ids is required');
    const permissions = await UserPermissionsModel.findAll({
      where: { id: args.permIds },
    });

    const role = await UserRoleModel.findOne({ where: { id: args.role, organizationId: user.organizationId } });
    if (!role) throw new Error(`${args.role} role does not exist`);
    await role.setPermissions(permissions);
  }

  static async removePermissionsFromRole(
    args: { permIds: string[]; role: `${UserTypes}` },
    user: Pick<User, 'id' | 'organizationId'>
  ) {
    if (!args.permIds || args.permIds.length === 0) throw new Error('permission ids is required');
    const permissions = await UserPermissionsModel.findAll({
      where: { id: args.permIds },
    });

    const role = await UserRoleModel.findOne({ where: { name: args.role, organizationId: user.organizationId } });
    if (!role) throw new Error(`${args.role} role does not exist`);
    await role.removePermissions(permissions);
  }
}
