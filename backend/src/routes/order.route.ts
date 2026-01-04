import express from 'express';
import { authMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { OrderService } from '../services/order.service';
import { validateOrderSchema } from '../middleware/validation/order';
export const orderRoute = express.Router();

orderRoute.get('/get-all', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await OrderService.getOrders(req.user!, { page, limit, offset }, { search, status } as any);
    const response: APIResponseFormat<any> = {
      message: 'order retreived successfully',
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

orderRoute.get('/get-all-assigned-orders', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await OrderService.getAsignedOrders(req.user!, { page, limit, offset });
    const response: APIResponseFormat<any> = {
      message: 'asigned order retreived successfully',
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

orderRoute.post('/update-order-status', authMiddleware, validateOrderSchema(), async (req, res) => {
  try {
    const status = req.body.status as any;
    const orderId = req.body.orderId;

    await OrderService.updateOrderStatus(req.user!, orderId, status);
    const response: APIResponseFormat<any> = {
      message: 'order status updated successfully',
      data: [],
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

orderRoute.post('/update-order', authMiddleware, async (req, res) => {
  try {
    const data = await OrderService.updateOrder(req.body, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'order updated successfully',
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

orderRoute.get('/orders-stats', authMiddleware, async (req, res) => {
  try {
    const data = await OrderService.getOrderStats(req.user!);
    const response: APIResponseFormat<any> = {
      message: 'order stats retrieved successfully',
      data,
    };
    console.log('================response====================');
    console.log(response);
    console.log('====================================');
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
