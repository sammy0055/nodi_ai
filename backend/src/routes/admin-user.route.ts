import express from 'express';
import { AdminUserModel } from '../models/admin-user.model';
import { generateTokens } from '../utils/jwt';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { adminAuthMiddleware } from '../middleware/authentication';
import { setAuthHeaderCookie } from '../helpers/set-auth-header';
export const adminUserRoute = express.Router();

adminUserRoute.post('/create-user', async (req, res) => {
  try {
    const adminUser = await AdminUserModel.create(req.body);

    // JWT payload
    const payload = {
      id: adminUser.id,
      email: adminUser.email,
      type: adminUser.type,
    };

    // Generate tokens
    const { accessToken, refreshToken, expires_in } = generateTokens(payload);
    const data = {
      user: {
        id: adminUser.id,
        email: adminUser.email,
        type: adminUser.type,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in,
      },
    };
    const response: APIResponseFormat<any> = {
      message: 'admin user created successfully',
      data,
    };

     setAuthHeaderCookie(res, data.tokens, "admin_auth_tokens");
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

adminUserRoute.post('/login', async (req, res) => {
  try {
    const adminUser = await AdminUserModel.findOne({ where: { email: req.body.email } });
    if (!adminUser) throw new Error('adminUser does not exist');

    // JWT payload
    const payload = {
      id: adminUser.id!,
      email: adminUser.email,
      type: adminUser.type,
    };

    // Generate tokens
    const { accessToken, refreshToken, expires_in } = generateTokens(payload);
    const data = {
      user: {
        id: adminUser.id,
        email: adminUser.email,
        type: adminUser.type,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in,
      },
    };
    const response: APIResponseFormat<any> = {
      message: 'admin user logged in successfully',
      data,
    };

     setAuthHeaderCookie(res, data.tokens, "admin_auth_tokens");
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

adminUserRoute.get('/current-user', adminAuthMiddleware, async (req, res) => {
  try {
    if (!req.adminUser) throw new Error('internal server error');
    const data = await AdminUserModel.findByPk(req.adminUser.id);
    const response: APIResponseFormat<any> = {
      message: 'admin user logged in successfully',
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
