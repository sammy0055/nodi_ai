import express from 'express';
import { authMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { CustomerService } from '../services/customer.service';
export const customerRoute = express.Router();

customerRoute.get('/get-all', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = req.query.searchQuery || '';

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await CustomerService.getCustomers(req.user!, { page, limit, offset }, searchQuery as string);
    const response: APIResponseFormat<any> = {
      message: 'customers retreived successfully',
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

