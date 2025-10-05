import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './models/index.js';
import { appConfig } from './config/index.js';
import { organizationRoute } from './routes/organization.route';
import { userRoute } from './routes/users.route';
import { WhatSappRoute } from './routes/whatsapp-settings.route';
import { zoneRoute } from './routes/zone.route';
import { branchRoute } from './routes/branch.route';
import { areaRoute } from './routes/area.route';
import { productRoute } from './routes/product.route';
import { subscriptionRoute } from './routes/subscription-plan.route';
import { productOptionRoute } from './routes/product-option.route';
import { productOptionChoiceRoute } from './controllers/productOption-choice.route';
import { requestRoute } from './routes/request.route';
import { adminUserRoute } from './routes/admin-user.route';
import { appUserAuthSecretValidation } from './middleware/authentication';
import { branchInventoryRoute } from './routes/branch-inventory.route';
import { subscriptionRouter } from './routes/subscription.route';
import { stripeWebHookRoute } from './routes/stripe-webhook.route';
import { ManageVectorStore } from './helpers/vector-store.js';
import { ChatService } from './mcp/ChatService.js';

const app = express();

// dedicated routes
app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebHookRoute);

app.use(cors({ origin: ['http://localhost:5173', true], credentials: true }));
app.use(cookieParser());
app.use(express.json());

// routes
app.use('/api/user', userRoute);
app.use('/api/organization', organizationRoute);
app.use('/api/whatsapp-settings', WhatSappRoute);
app.use('/api/organization/zone', zoneRoute);
app.use('/api/organization/area', areaRoute);
app.use('/api/organization/branch', branchRoute);
app.use('/api/organization/branch-inventory', branchInventoryRoute);
app.use('/api/organization/product', productRoute);
app.use('/api/organization/product-option', productOptionRoute);
app.use('/api/organization/product-option-choice', productOptionChoiceRoute);
app.use('/api/organization/request', requestRoute);
app.use('/api/organization/subscription', subscriptionRouter);
app.use('/api/organization/subscription-plan', subscriptionRoute);

// app-user routes
app.use('/api/app-user/subscription-plan', appUserAuthSecretValidation, subscriptionRoute);
app.use('/api/app-user', appUserAuthSecretValidation, adminUserRoute);
app.use('/api/app-user/request', appUserAuthSecretValidation, requestRoute);

// test
app.post('/api/chat', async (req, res) => {
  const whatsappBusinessId = req.body.whatsappBusinessId;
  const userPhoneNumber = req.body.userPhoneNumber;
  const userMessage = req.body.message;

  try {
    const chat = await ChatService.init(userPhoneNumber, whatsappBusinessId);
    await chat.connectToServer();
    const response = await chat.processQuery(userMessage);
    return res.send(response);
  } catch (error: any) {
    console.log('chat-error', error);
    return res.status(500).json({ error: error.message });
  }
});

const vectorStore = new ManageVectorStore();
const PORT = appConfig.port;
app.listen(PORT, async () => {
  await connectDB();
  await vectorStore.initCollection();
});
