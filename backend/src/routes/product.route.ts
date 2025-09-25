import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { ProductController } from '../controllers/product.controller';
import { validatecreateProductSchemaBody } from '../middleware/validation/product';

export const productRoute = express.Router();
const storage = multer.memoryStorage(); // or diskStorage if you want to save the file
const upload = multer({ storage });

productRoute.post(
  '/create-product',
  authMiddleware,
  upload.single('file'),
  validatecreateProductSchemaBody(),
  async (req, res) => {
    try {
      const data = await ProductController.createProduct(req.body, req.user!, req.file!);
      const response: APIResponseFormat<any> = {
        message: 'product created successfully',
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

productRoute.put('/products/:id', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await ProductController.updateProduct({ ...req.body, id }, req.user!, req.file!);
    const response: APIResponseFormat<any> = {
      message: 'product updated successfully',
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

productRoute.delete('/products/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    await ProductController.removeProduct(id, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'product updated successfully',
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

productRoute.get('/products/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await ProductController.getProduct(id, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'product updated successfully',
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

productRoute.get('/products', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = req.query.searchQuery || '';

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await ProductController.getProducts(req.user!, { page, limit, offset }, searchQuery as string);
    const response: APIResponseFormat<any> = {
      message: 'product retreived successfully',
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
