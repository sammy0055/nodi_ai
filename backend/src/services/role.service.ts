import { Op } from 'sequelize';
import { UserTypes } from '../data/data-types';
import { UserPermissionsModel } from '../models/permission.model';
import { UserRoleModel } from '../models/role.model';
import { User } from '../types/users';

export class roleService {
  constructor() {}

  static async createRole(role: `${UserTypes}`) {
    return await UserRoleModel.create({ name: role });
  }

  static async updateRole(role: { id: string; name: string; description: string }) {
    if (!role.id) throw new Error('role id is required');
    const oldRole = await UserRoleModel.findByPk(role.id);
    if (!oldRole) throw new Error('role does not exist is required');
    if (oldRole.name === UserTypes.SuperAdmin) throw new Error("super-admin role can't be edited");
    if (!Object.values(UserTypes).includes(role.name as UserTypes)) throw new Error('role name is not supported');
    const [_, updatedRole] = await UserRoleModel.update(role, { where: { id: role.id }, returning: true });
    return updatedRole[0].get({ plain: true }); // plain JS object
  }

  static async getRoles() {
    return await UserRoleModel.findAll({
      where: {
        name: {
          [Op.ne]: 'super-admin',
        },
      },
      include: {
        model: UserPermissionsModel,
        as: 'permissions',
      },
    });
  }

  static async removeRole(id: string) {
    await UserRoleModel.destroy({ where: { id } });
  }

  static async addPermissionsToRole(
    args: { permIds: string[]; role: `${UserTypes}` },
    user: Pick<User, 'id' | 'organizationId'>
  ) {
    if (!args.permIds || args.permIds.length === 0) throw new Error('permission ids is required');
    const permissions = await UserPermissionsModel.findAll({
      where: { id: args.permIds },
    });

    const role = await UserRoleModel.findOne({ where: { id: args.role } });
    if (!role) throw new Error(`${args.role} role does not exist`);
    await role.setPermissions(permissions);
  }

  static async removePermissionsFromRole(args: { permIds: string[]; role: `${UserTypes}` }) {
    if (!args.permIds || args.permIds.length === 0) throw new Error('permission ids is required');
    const permissions = await UserPermissionsModel.findAll({
      where: { id: args.permIds },
    });

    const role = await UserRoleModel.findOne({ where: { name: args.role } });
    if (!role) throw new Error(`${args.role} role does not exist`);
    await role.removePermissions(permissions);
  }
}
