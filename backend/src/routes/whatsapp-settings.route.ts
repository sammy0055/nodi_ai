import express from 'express';
import { authMiddleware } from '../middleware/authentication';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { WhatSappSettingsController } from '../controllers/whatsapp-settings.controller';
import { validateWhatsappSettingsSchema } from '../middleware/validation/whatsapp-settings';
const WhatSappRoute = express.Router();

WhatSappRoute.get('/get-whatsapp-auth-url', authMiddleware, (req, res) => {
  try {
    const data = WhatSappSettingsController.getWhatSappAuthUrl();
    const response: APIResponseFormat<any> = {
      message: 'whatsapp auth url created successfully',
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

WhatSappRoute.post('/exchange-whatsapp-code-for-access-token', validateWhatsappSettingsSchema(), async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user };
    const data = await WhatSappSettingsController.exchangeWhatSappCodeForAccessTokens(payload);
    const response: APIResponseFormat<any> = {
      message: 'whatsapp accessToken retrieved successfully',
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

WhatSappRoute.post('/mock-add-data', authMiddleware, async (req, res) => {
  try {
    const data = await WhatSappSettingsController.mockAddWhsappData(req.body, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'data added successfully',
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

export { WhatSappRoute };
