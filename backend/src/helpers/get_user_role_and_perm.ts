import { UserPermissionsModel } from '../models/permission.model';
import { UserRoleModel } from '../models/role.model';
import { UsersModel } from '../models/users.model';

export const getUserRoleAndPermission = async (user: { id: string; organizationId: string }) => {
  const currentUser = (await UsersModel.findByPk(user.id, {
    include: [
      {
        model: UserRoleModel,
        as: 'roles',
        where: user.organizationId ? { organizationId: user.organizationId } : {},
        required: false, // keep users without roles
        include: [
          {
            model: UserPermissionsModel,
            as: 'permissions',
            through: { attributes: [] }, // hide join table
          },
        ],
      },
    ],
  })) as any;
  if (!currentUser) throw new Error('User not found');
  return { currentUser, userRole: currentUser.roles[0].name, UserPermissions: currentUser.roles[0].permissions };
};
