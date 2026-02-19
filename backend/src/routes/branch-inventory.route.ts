import express from 'express';
import { authMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { BranchInventoryService } from '../services/branch-inventory.service';
export const branchInventoryRoute = express.Router();

branchInventoryRoute.post('/create', authMiddleware, async (req, res) => {
  try {
    const data = await BranchInventoryService.createInventory(req.body, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'branch-inventory retrieved successfully',
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

branchInventoryRoute.post('/update', authMiddleware, async (req, res) => {
  try {
    const data = await BranchInventoryService.updateInventory(req.body, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'branch-inventory updated successfully',
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

branchInventoryRoute.get('/get-inventories', authMiddleware, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as any;
  const isActive = req.query.isActive as string;
  const branchId = req.query.branchId as string;
  const quantityReserved = req.query.quantityReserved && (Number(req.query.quantityReserved) as any);
  const quantityOnHand = req.query.quantityOnHand && (Number(req.query.quantityOnHand) as any);
  // calculate offset
  const offset = (page - 1) * limit;
  try {
    const data = await BranchInventoryService.getBranchInventories(
      req.user!,
      { page, limit, offset },
      { search, isActive, quantityReserved, quantityOnHand, branchId }
    );
    const response: APIResponseFormat<any> = {
      message: 'branch-inventory updated successfully',
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

branchInventoryRoute.delete('/inventory/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    await BranchInventoryService.deleteInventory(id, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'branch-inventory deleted successfully',
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
