import { Request, Response, NextFunction } from 'express';
import { generateTokens, verifyToken } from '../utils/jwt';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/users.service';
import { appConfig } from '../config';
import { setAuthHeaderCookie } from '../helpers/set-auth-header';

export interface TokenPayload {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get token from header or cookie
    const headerToken = req.headers['authorization'];
    const tokens = req.cookies['auth_tokens'] as TokenPayload | undefined;

    if (!headerToken && !tokens) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userToken = tokens?.access_token || headerToken;

    try {
      // 2. Verify token
      const { id, organizationId, email, userType } = verifyToken(userToken!, 'access') as any;
      req.user = { id, organizationId, email, userType };
      return next();
    } catch (err: any) {
      // 3. If expired, try refresh
      if (err instanceof jwt.TokenExpiredError && tokens?.refresh_token) {
        try {
          const newTokens = await UserService.refreshToken(tokens.refresh_token);

          setAuthHeaderCookie(res, newTokens, "auth_tokens");

          const { id, organizationId, email, userType } = verifyToken(newTokens.access_token, 'access') as any;
          req.user = { id, organizationId, email, userType };
          return next();
        } catch (refreshErr) {
          return res.status(401).json({ message: 'Refresh Token expired', error: refreshErr });
        }
      }

      // Other JWT errors
      return res.status(403).json({ message: err.message, error: err });
    }
  } catch (outerErr) {
    return res.status(500).json({ message: 'Auth middleware error', error: outerErr });
  }
};

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get token from header or cookie
    const headerToken = req.headers['authorization']?.split(' ')[1];
    const tokens = req.cookies['admin_auth_tokens'] as TokenPayload | undefined;

    if (!headerToken && !tokens) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const adminToken = tokens?.access_token || headerToken;

    try {
      // 2. Verify token
      const { id, email, type } = verifyToken(adminToken!, 'access') as any;
      req.adminUser = { id, email, type };
      return next();
    } catch (err: any) {
      // 3. If expired, try refresh
      if (err instanceof jwt.TokenExpiredError && tokens?.refresh_token) {
        try {
          const decoded = verifyToken(tokens.refresh_token, 'refresh') as any;
          const payload = {
            id: decoded.id,
            email: decoded.email,
            type: decoded.type,
          };

          const { accessToken, refreshToken, expires_in } = generateTokens(payload);
          const newTokens = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in,
          };
         setAuthHeaderCookie(res, newTokens, "auth_tokens");

          const { id, email, type } = verifyToken(newTokens.access_token, 'access') as any;
          req.adminUser = { id, email, type };
          return next();
        } catch (refreshErr) {
          return res.status(401).json({ message: 'Refresh Token expired', error: refreshErr });
        }
      }

      // Other JWT errors
      return res.status(403).json({ message: err.message, error: err });
    }
  } catch (outerErr) {
    return res.status(500).json({ message: 'Auth middleware error', error: outerErr });
  }
};

export const appUserAuthSecretValidation = async (req: Request, res: Response, next: NextFunction) => {
  const appUserSecret = req.headers['app-user-secret'];
  if (appUserSecret !== appConfig.appUser.authSecret)
    res.status(403).json({ errorCode: 'unauthorized', level: 'cretical', message: 'unauthorized' });
  next();
};
