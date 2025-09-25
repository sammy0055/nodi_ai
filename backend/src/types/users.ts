import { UserTypes } from '../data/data-types';

export interface ISignUp {
  id: string; // uuid
  name: string;
  email: string;
  password: string;
  bussinessName: string;
  userType: `${UserTypes}`;
  authType: any;
}

export interface User {
  id: string;
  organizationId?: string | null;
  name: string;
  email: string;
  password: string;
  userType: `${UserTypes}`;
}

export interface AdminUser {
  id: string;
  type: 'admin';
  name: string;
  email: string;
  password: string;
}
