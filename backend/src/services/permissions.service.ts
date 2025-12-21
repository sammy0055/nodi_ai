import { UserPermissionsModel } from '../models/permission.model';

export class permissionsService {
  constructor() {}
  static async createPermissions(perms: { key: string }[]) {
    const permissions = await UserPermissionsModel.bulkCreate([...perms]);
    return permissions;
  }

  static async updatePermission(perm: { id: string; key: string; description: string }) {
    const oldPerm = await UserPermissionsModel.findByPk(perm.id);
    if (!oldPerm) throw new Error('permission does not exist');
    const [_, updatedPerm] = await UserPermissionsModel.update(perm, { where: { id: perm.id }, returning: true });
    return updatedPerm[0].get({ plain: true }); // plain JS object
  }

  static async getPermissions() {
    return await UserPermissionsModel.findAll();
  }

  static async deletePermission(permId: string) {
    await UserPermissionsModel.destroy({ where: { id: permId } });

    // remove all permissions
    // await UserPermissionsModel.destroy({
    //   where: {},
    //   truncate: true,
    // });
  }
}
