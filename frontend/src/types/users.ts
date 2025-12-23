export type Role = {
  id: string;
  name: string;
  description: string;
  permissions?:Permission[]
};

export type Permission = {
  id: string;
  key: string;
  description: string;
};

export interface User {
  id: string;
  organizationId?: string | null;
  name: string;
  email: string;
  password: string;
  roles: Role[];
  activeOrderCount?: number;
  maxConcurrentOrders?: number;
  isActive?: boolean;
  lastActive?: Date;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  type: 'admin';
}
