import express from 'express';
import { validateBranchSchema, validateUpdateBranchSchema } from '../middleware/validation/branch';
import { authMiddleware } from '../middleware/authentication';
import { BranchController } from '../controllers/branch.controller';
import { errorLogger } from '../helpers/logger';
import { APIResponseFormat } from '../types/apiTypes';

export const branchRoute = express.Router();

branchRoute.post('/create-branch', validateBranchSchema(), authMiddleware, async (req, res) => {
  try {
    const data = await BranchController.createBranch(req.body, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'branch created successfully',
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

branchRoute.put('/branches/:id', validateUpdateBranchSchema(), authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await BranchController.updateBranch({ ...req.body, id }, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'branch updated successfully',
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

branchRoute.delete('/branches/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    await BranchController.removeBranch(id, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'branch deleted successfully',
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

branchRoute.get('/branches/:id', authMiddleware, async (req, res) => {
  try {
    const branchId = req.params.id;
    const data = await BranchController.getBranch(branchId);
    const response: APIResponseFormat<any> = {
      message: 'branch retrieved successfully',
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

branchRoute.get('/branches', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await BranchController.getBranches(req.user!, { page, limit, offset });
    const response: APIResponseFormat<any> = {
      message: 'branch retrieved successfully',
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
