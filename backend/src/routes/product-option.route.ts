import express from 'express';
import { errorLogger } from '../helpers/logger';
import { APIResponseFormat } from '../types/apiTypes';
import { ProductOptionController } from '../controllers/product-option.controller';
import { authMiddleware } from '../middleware/authentication';
export const productOptionRoute = express.Router();

productOptionRoute.post('/create', authMiddleware, async (req, res) => {
  try {
    const data = await ProductOptionController.create(req.body, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'product option created successfully',
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

productOptionRoute.post('/update', authMiddleware, async (req, res) => {
  try {
    const data = await ProductOptionController.update(req.body);
    const response: APIResponseFormat<any> = {
      message: 'product option updated successfully',
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

productOptionRoute.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const data = await ProductOptionController.remove(req.params.id);
    const response: APIResponseFormat<any> = {
      message: 'product option deleted successfully',
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

productOptionRoute.post('/get-many', authMiddleware, async (req, res) => {
  try {
    const productIds = req.body.productIds as string[];
    const data = await ProductOptionController.getMany({ productIds: productIds });
    const response: APIResponseFormat<any> = {
      message: 'product option retrieved successfully',
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
