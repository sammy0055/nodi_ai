// adjust import to your project

import { UserTypes } from '../data/data-types';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      organizationId?: string;
      email: string;
      userType: `${UserTypes}`;
    }

    interface AdminUserPayload {
      id: string;
      email: string;
      type: 'admin';
    }

    interface Request {
      user?: UserPayload;
      adminUser?: AdminUserPayload;
    }
  }
}
