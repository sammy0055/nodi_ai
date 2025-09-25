import express from 'express';
import { authMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { AreaController } from '../controllers/area.controller';
import { validateAreaSchema, validateUpdateAreaSchema } from '../middleware/validation/area';

export const areaRoute = express.Router();

areaRoute.post('/create-area', validateAreaSchema(), authMiddleware, async (req, res) => {
  try {
    const data = await AreaController.createArea(req.body, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'area created successfully',
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

areaRoute.put('/areas/:id', validateUpdateAreaSchema(), authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await AreaController.updateArea({ ...req.body, id }, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'area updated successfully',
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

areaRoute.delete('/areas/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    await AreaController.removeArea(id, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'area removed successfully',
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

areaRoute.get('/areas/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await AreaController.getArea(id, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'area retreived successfully',
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

areaRoute.get('/areas', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await AreaController.getAreas(req.user!, { page, limit, offset });
    const response: APIResponseFormat<any> = {
      message: 'area retreived successfully',
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
