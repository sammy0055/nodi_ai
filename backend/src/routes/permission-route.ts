import express from 'express';
import { adminAuthMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { permissionsService } from '../services/permissions.service';
import { validatePermissionSchema } from '../middleware/validation/permision';

export const userPermissionRoute = express.Router();

userPermissionRoute.post('/create-permissions', adminAuthMiddleware, validatePermissionSchema(), async (req, res) => {
  try {
    const data = await permissionsService.createPermissions(req.body);
    const response: APIResponseFormat<any> = {
      message: 'permissions created successfully',
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

userPermissionRoute.get('/get-permissions', adminAuthMiddleware, async (req, res) => {
  try {
    const data = await permissionsService.getPermissions();
    const response: APIResponseFormat<any> = {
      message: 'permissions retreived successfully',
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

userPermissionRoute.delete('/delete-permission', adminAuthMiddleware, async (req, res) => {
  try {
    await permissionsService.deletePermission(req.body.permId);
    const response: APIResponseFormat<any> = {
      message: 'permissions deleted successfully',
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
