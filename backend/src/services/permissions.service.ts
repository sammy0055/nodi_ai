import { UserPermissionsModel } from '../models/permission.model';

export class permissionsService {
  constructor() {}
  static async createPermissions(perms: { key: string }[]) {
    const permissions = await UserPermissionsModel.bulkCreate([...perms]);
    return permissions;
  }

  static async getPermissions() {
    return await UserPermissionsModel.findAll();
  }

  static async deletePermission(permId: string) {
    await UserPermissionsModel.destroy({ where: { id: permId } });
  }
}
