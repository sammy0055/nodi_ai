export interface ISignUp {
  id: string; // uuid
  name: string;
  email: string;
  password: string;
  bussinessName: string;
  authType: any;
}

export interface User {
  id: string;
  organizationId?: string | null;
  name: string;
  email: string;
  password: string;
  roles?: { id: string; name: string }[];
}

export interface AdminUser {
  id: string;
  type: 'admin';
  name: string;
  email: string;
  password: string;
}
