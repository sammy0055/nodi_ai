import type { UserTypes } from '../data/data-types';

export interface User {
  id: string;
  organizationId?: string | null;
  name: string;
  email: string;
  password: string;
  userType: UserTypes;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  type: 'admin';
}
