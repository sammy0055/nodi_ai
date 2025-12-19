import express from 'express';
import { adminAuthMiddleware } from '../middleware/authentication';
import { roleService } from '../services/role.service';
import { errorLogger } from '../helpers/logger';
import { APIResponseFormat } from '../types/apiTypes';
import { validateRoleSchema } from '../middleware/validation/role';

export const userRoleRoute = express.Router();

userRoleRoute.post('/create-role', adminAuthMiddleware, validateRoleSchema(), async (req, res) => {
  try {
    const role = req.body.role;
    const data = await roleService.createRole(role);

    const response: APIResponseFormat<any> = {
      message: 'role created successfully',
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

userRoleRoute.get('/get-roles', adminAuthMiddleware, async (req, res) => {
  try {
    const data = await roleService.getRoles();
    const response: APIResponseFormat<any> = {
      message: 'roles retrieved successfully',
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

userRoleRoute.delete('/delete-role', adminAuthMiddleware, async (req, res) => {
  try {
    await roleService.removeRole(req.body.roleId);
    const response: APIResponseFormat<any> = {
      message: 'roles deleted successfully',
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

