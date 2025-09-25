import express from 'express';
import { validatecreateOrganizationSchemaBody } from '../middleware/validation/organization';
import { OrganizationController } from '../controllers/organization.controller';
import { APIResponseFormat } from '../types/apiTypes';
import { IOrganization } from '../types/organization';
import { errorLogger } from '../helpers/logger';
import { authMiddleware, TokenPayload } from '../middleware/authentication';
import { UserController } from '../controllers/user.controller';
import { UsersModel } from '../models/users.model';
import { generateTokens } from '../utils/jwt';
import { setAuthHeaderCookie } from '../helpers/set-auth-header';

const organizationRoute = express.Router();

organizationRoute.post(
  '/create',
  validatecreateOrganizationSchemaBody(),
  authMiddleware,
  async (req, res): Promise<void> => {
    try {
      const body = req.body;
      const user = req.user;
      const data = (await OrganizationController.createOrganization(body, user!)) as any;

      const response: APIResponseFormat<IOrganization> = {
        message: 'organization created successfully',
        data,
      };

      const realUser = await UsersModel.findByPk(user!.id);
      const payload = {
        id: realUser!.id,
        organizationId: realUser!.organizationId || '',
        email: realUser!.email,
        userType: realUser!.userType,
      };

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(payload);
      const token = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900, // 15 minutes = 900 seconds
      };

      setAuthHeaderCookie(res, token, 'auth_tokens');
      res.status(201).json(response);
    } catch (error: any) {
      const response: APIResponseFormat<null> = {
        message: error.message,
        error: error,
      };
      errorLogger(error);
      res.status(500).json(response);
    }
  }
);

organizationRoute.post('/update-organization', authMiddleware, async (req, res) => {
  try {
    const organizationId = req.body.organizationId;
    const data = await OrganizationController.updateOrganization(organizationId, req.body);
    const response: APIResponseFormat<IOrganization> = {
      message: 'organization created successfully',
      data,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

organizationRoute.get('/get-organization', authMiddleware, async (req, res) => {
  try {
    const data = await OrganizationController.getOrganization(req.query.id as string, req.user as any);
    const response: APIResponseFormat<any> = {
      message: 'request successfully',
      data,
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

export { organizationRoute };
