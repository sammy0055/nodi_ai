import express from 'express';
import {
  validatecreateOrganizationSchemaBody,
  validatesetOrgFQAQuestionsSchemaBody,
  validatesetOrgReviewQuestionsSchemaBody,
} from '../middleware/validation/organization';
import { OrganizationController } from '../controllers/organization.controller';
import { APIResponseFormat } from '../types/apiTypes';
import { IOrganization } from '../types/organization';
import { errorLogger } from '../helpers/logger';
import { adminAuthMiddleware, authMiddleware } from '../middleware/authentication';
import { UsersModel } from '../models/users.model';
import { generateTokens } from '../utils/jwt';
import { setAuthHeaderCookie } from '../helpers/set-auth-header';
import { OrganizationService } from '../services/organization.service';

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

organizationRoute.post(
  '/set-org-review-questions',
  authMiddleware,
  validatesetOrgReviewQuestionsSchemaBody(),
  async (req, res) => {
    try {
      const data = await OrganizationController.setOrgReviewQuestions(req.body, req.user!);
      const response: APIResponseFormat<any> = {
        message: 'review questions set successfully',
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
  }
);

organizationRoute.post(
  '/set-org-fqa-questions',
  authMiddleware,
  validatesetOrgFQAQuestionsSchemaBody(),
  async (req, res) => {
    try {
      const data = await OrganizationController.setOrgFQAQuestions(req.body, req.user!);
      const response: APIResponseFormat<any> = {
        message: 'review questions set successfully',
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
  }
);

organizationRoute.post('/set-org-review-timer', authMiddleware, async (req, res) => {
  try {
    const data = await OrganizationController.setOrgReviewTimer(req.body.timer, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'review timer set successfully',
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

// app-user route actions ----------------------------------
organizationRoute.get('/organization-statistics', adminAuthMiddleware, async (req, res) => {
  try {
    const data = await OrganizationController.getOrganizatonsStatitics();
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

organizationRoute.get('/get-organizations-for-admin', adminAuthMiddleware, async (req, res) => {
  try {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 5;
    const searchQuery = req.query.searchQuery || '';

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await OrganizationController.getOrganizationsForAdmin({ offset, limit, page }, searchQuery as string);
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

organizationRoute.post('/update-organization-status-for-admin', adminAuthMiddleware, async (req, res) => {
  try {
    const status = req.body.status;
    const id = req.body.id;
    await OrganizationService.updateOrganizationStatusForAdmin({ status, id });
    const response: APIResponseFormat<any> = {
      message: 'request successfully',
      data: null,
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
