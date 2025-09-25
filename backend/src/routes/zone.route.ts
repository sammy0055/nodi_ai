import express from 'express';
import { ZoneController } from '../controllers/zone.controller';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { authMiddleware } from '../middleware/authentication';

export const zoneRoute = express.Router();

zoneRoute.post('/create-zone', authMiddleware, async (req, res) => {
  try {
    const name = req.body.name;
    const user = req.user;
    const data = await ZoneController.createZone(name, user!);
    const response: APIResponseFormat<any> = {
      message: 'zone created successfully',
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

zoneRoute.post('/update-zone', authMiddleware, async (req, res) => {
  try {
    const name = req.body.name;
    const zoneId = req.body.zoneId;
    const data = await ZoneController.updateZone(name, zoneId);
    const response: APIResponseFormat<any> = {
      message: 'zone updated successfully',
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

zoneRoute.get('/get-zone', authMiddleware, async (req, res) => {
  try {
    const data = await ZoneController.getZone(req.query.zoneId as string);
    const response: APIResponseFormat<any> = {
      message: 'zone retrieved successfully',
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

zoneRoute.get('/get-zones', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await ZoneController.getZones(req.user!, { page, limit, offset });
    const response: APIResponseFormat<any> = {
      message: 'zones retrieved successfully',
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
