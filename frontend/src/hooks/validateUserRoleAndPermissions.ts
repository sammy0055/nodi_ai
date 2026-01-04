import type { User, UserRoles } from '../types/users';

const permissions = Object.freeze([
  { key: 'order.create', description: 'Create a new customer order in the system' },
  { key: 'order.process', description: 'Process and update the status of an order' },
  { key: 'order.cancel', description: 'Cancel an existing order' },
  { key: 'order.view', description: 'View order details and order history' },

  { key: 'product.create', description: 'Add new products to the catalog' },
  { key: 'product.update', description: 'Edit product details, pricing, and availability' },
  { key: 'product.delete', description: 'Remove products from the catalog' },
  { key: 'product.view', description: 'View product information and listings' },

  { key: 'inventory.view', description: 'View inventory levels and stock status' },
  { key: 'inventory.update', description: 'Update stock quantities and adjustments' },
  { key: 'inventory.transfer', description: 'Transfer inventory between branches' },

  { key: 'user.create', description: 'Create and onboard new users or staff accounts' },
  { key: 'user.update', description: 'Update user details and profile information' },
  { key: 'user.assignRole', description: 'Assign roles and permissions to users' },
  { key: 'user.view', description: 'View user accounts and roles' },
  { key: 'user.deactivate', description: 'Deactivate or suspend user accounts' },

  { key: 'branch.create', description: 'Create a new business branch' },
  { key: 'branch.update', description: 'Update branch details and settings' },
  { key: 'branch.view', description: 'View branch information and performance' },
  { key: 'branch.delete', description: 'Remove a branch from the system' },

  { key: 'area.create', description: 'Create a new operational or delivery area' },
  { key: 'area.update', description: 'Update area details and coverage' },
  { key: 'area.view', description: 'View areas and assigned branches' },
  { key: 'area.delete', description: 'Delete an operational or delivery area' },
] as const);

// ✅ union type derived from the array
export type PermissionKey = (typeof permissions)[number]['key'];

export const useValidateUserRolesAndPermissions = (user: User) => {
  const getUserRole = (): UserRoles => {
    return user.roles[0].name;
  };
  const isUserRoleValid = (userRole: UserRoles) => {
    return user.roles[0].name === userRole;
  };

  const isUserPermissionsValid = (permissions: PermissionKey[]) => {
    const validKeys = user.roles[0].permissions!.map((p) => p.key);
    return permissions.every((p) => validKeys.includes(p));
  };

  return {
    getUserRole,
    isUserRoleValid,
    isUserPermissionsValid,
  };
};
