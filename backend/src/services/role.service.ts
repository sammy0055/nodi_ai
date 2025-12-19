import { UserTypes } from '../data/data-types';
import { UserPermissionsModel } from '../models/permission.model';
import { UserRoleModel } from '../models/role.model';

export class roleService {
  constructor() {}

  static async createRole(role: `${UserTypes}`) {
    return await UserRoleModel.create({ name: role });
  }

  static async getRoles() {
    return await UserRoleModel.findAll();
  }

  static async removeRole(id: string) {
    await UserRoleModel.destroy({ where: { id } });
  }

  static async addPermissionsToRole(args: { permIds: string[]; role: `${UserTypes}` }) {
    if (!args.permIds || args.permIds.length === 0) throw new Error('permission ids is required');
    const permissions = await UserPermissionsModel.findAll({
      where: { id: args.permIds },
    });

    const role = await UserRoleModel.findOne({ where: { name: args.role } });
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
