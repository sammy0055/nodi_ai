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
import { subscriptionPlanRoute } from './routes/subscription-plan.route';
import { productOptionRoute } from './routes/product-option.route';
import { productOptionChoiceRoute } from './controllers/productOption-choice.route';
import { requestRoute } from './routes/request.route';
import { adminUserRoute } from './routes/admin-user.route';
import { appUserAuthSecretValidation } from './middleware/authentication';
import { branchInventoryRoute } from './routes/branch-inventory.route';
import { subscriptionRouter } from './routes/subscription.route';
import { stripeWebHookRoute } from './routes/stripe-webhook.route';
import { ManageVectorStore } from './helpers/vector-store.js';
import { chatRoute } from './mcp/chat-webhook.js';
import { orderRoute } from './routes/order.route.js';
import { customerRoute } from './routes/customer.route.js';
import { reviewRoute } from './routes/review.route.js';
import { convRoute } from './routes/conversation.route.js';
import { NotificationRoute } from './routes/notification.route.js';
import { adminEmailListRoute } from './routes/admin-email-list.route.js';
import { whatsappFlowRoute } from './routes/whatsapp-flow.js';
import { queueConsumer } from './helpers/rabbitmq/index.js';
import { userRoleRoute } from './routes/role.route.js';
import { userPermissionRoute } from './routes/permission-route.js';

const app = express();

// dedicated routes
app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebHookRoute);

app.use(cors({ origin: ['http://localhost:5173', 'https://labanon.naetechween.com', true], credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/api/chat', chatRoute);

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
app.use('/api/organization/subscription-plan', subscriptionPlanRoute);
app.use('/api/organization/order', orderRoute);
app.use('/api/organization/customers', customerRoute);
app.use('/api/organization/review', reviewRoute);

// app-user routes
app.use('/api/app-user/subscription-plan', appUserAuthSecretValidation, subscriptionPlanRoute);
app.use('/api/app-user/subscription', appUserAuthSecretValidation, subscriptionRouter);
app.use('/api/app-user', appUserAuthSecretValidation, adminUserRoute);
app.use('/api/app-user/request', appUserAuthSecretValidation, requestRoute);
app.use('/api/app-user/organization', appUserAuthSecretValidation, organizationRoute);
app.use('/api/app-user/conversation', appUserAuthSecretValidation, convRoute);
app.use('/api/app-user/notification', appUserAuthSecretValidation, NotificationRoute);
app.use('/api/app-user/notification-email-list', appUserAuthSecretValidation, adminEmailListRoute);
app.use('/api/app-user/role', appUserAuthSecretValidation, userRoleRoute);
app.use('/api/app-user/permissions', userPermissionRoute);

// whatsapp flow route
app.use('/api/whatsappflow', whatsappFlowRoute);

const vectorStore = new ManageVectorStore();
const PORT = appConfig.port;
app.listen(PORT, async () => {
  await connectDB();
  queueConsumer();
  await vectorStore.initCollection();
});
