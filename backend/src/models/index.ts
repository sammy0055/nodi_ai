import { OrganizationsModel } from './organizations.model';
import { BranchesModel } from './branches.model';
import { UsersModel } from './users.model';
import { sequelize } from './db';
import { WhatSappSettingsModel } from './whatsapp-settings.model';
import { ProductModel } from './products.model';
import { BranchInventoryModel } from './branch-inventory.model';
import { ZoneModel } from './zones.model';
import { AreaModel } from './area.model';
import { SubscriptionPlanModel } from './subscription-plan.model';
import { SubscriptionsModel } from './subscriptions.model';
import { CreditBalanceModel } from './creditBalance.model';
import { UsageRecordModel } from './usage-records.model';
import { CreditTransactionsModel } from './creditTransaction.model';
import { ProductOptionModel } from './product-option.model';
import { ProductOptionChoiceModel } from './product-option-choice.model';
import { NotificationModel } from './notification.model';
import { RequestModel } from './request.module';
import { AdminUserModel } from './admin-user.model';

interface DbModels {
  OrganizationsModel: typeof OrganizationsModel;
  WhatSappSettingsModel: typeof WhatSappSettingsModel;
  BranchesModel: typeof BranchesModel;
  UsersModel: typeof UsersModel;
  AdminUserModel: typeof AdminUserModel;
  ProductModel: typeof ProductModel;
  ZoneModel: typeof ZoneModel;
  AreaModel: typeof AreaModel;
  BranchInventoryModel: typeof BranchInventoryModel;
  SubscriptionPlanModel: typeof SubscriptionPlanModel;
  SubscriptionsModel: typeof SubscriptionsModel;
  CreditBalanceModel: typeof CreditBalanceModel;
  CreditTransactionsModel: typeof CreditTransactionsModel;
  UsageRecordModel: typeof UsageRecordModel;
  ProductOptionModel: typeof ProductOptionModel;
  ProductOptionChoiceModel: typeof ProductOptionChoiceModel;
  NotificationModel: typeof NotificationModel;
  RequestModel: typeof RequestModel;
}

const models: DbModels = {
  UsersModel,
  AdminUserModel,
  OrganizationsModel,
  WhatSappSettingsModel,
  ProductModel,
  BranchesModel,
  ZoneModel,
  AreaModel,
  BranchInventoryModel,
  SubscriptionPlanModel,
  SubscriptionsModel,
  CreditBalanceModel,
  CreditTransactionsModel,
  UsageRecordModel,
  ProductOptionModel,
  ProductOptionChoiceModel,
  NotificationModel,
  RequestModel,
};

Object.values(models).forEach((model: any) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export { models, DbModels, connectDB };
