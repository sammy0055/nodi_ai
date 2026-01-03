import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { BusinessType, supportedBusinessTypes } from '../data/data-types';
import { ModelNames } from './model-names';
import { IOrganization, OrgReviewQuestions } from '../types/organization';
import { CurrencyCode } from '../types/product';

class OrganizationsModel
  extends Model<InferAttributes<OrganizationsModel>, InferCreationAttributes<OrganizationsModel>>
  implements IOrganization
{
  declare id: string;
  declare ownerId: string;
  declare name: string;
  declare businessType: `${BusinessType}`;
  declare brandTone: string;
  declare AIAssistantName: string;
  declare stripeCustomerId?: string | undefined;
  declare shouldUpdateChatbotSystemPrompt?: boolean | undefined;
  declare status: 'active' | 'suspended' | 'cancelled';
  declare languageProtectedTerms?: string[] | undefined;
  declare currency: CurrencyCode;
  declare reviewQuestions: OrgReviewQuestions[];
  declare frequentlyAskedQuestions: OrgReviewQuestions[];
  declare reviewTimer: number | null;
  static associate(models: DbModels) {
    //hasMany The foreign key is on the other model (the one being linked).
    this.hasMany(models.BranchesModel, { foreignKey: 'organizationId' });

    // Organization has many users
    this.hasMany(models.UsersModel, {
      foreignKey: 'organizationId',
      as: 'users',
    });

    // belongsTo → The foreign key is on this model (the one calling belongsTo).
    // Organization has one owner
    this.belongsTo(models.UsersModel, {
      foreignKey: 'ownerId',
      as: 'owner',
    });

    // Organization has many users
    this.hasMany(models.ProductModel, {
      foreignKey: 'organizationId',
      as: 'products',
    });

    // Organization has many WABA
    this.hasMany(models.WhatSappSettingsModel, {
      foreignKey: 'organizationId',
      as: 'whatsappsettings',
    });

    this.hasMany(models.NotificationModel, {
      foreignKey: 'organizationId',
      as: 'notifications',
    });

    this.hasMany(models.RequestModel, {
      foreignKey: 'organizationId',
      as: 'requests',
    });

    this.hasOne(models.SubscriptionsModel, {
      foreignKey: 'organizationId',
      as: 'subscription',
    });

    this.hasOne(models.CreditBalanceModel, {
      foreignKey: 'organizationId',
      as: 'creditBalance',
    });
  }
}

OrganizationsModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,

      references: {
        model: ModelNames.Users,
        key: 'id',
      },
    }, // special owner link
    name: { type: DataTypes.STRING, allowNull: false },
    businessType: { type: DataTypes.ENUM, values: supportedBusinessTypes },
    brandTone: { type: DataTypes.STRING, defaultValue: '' },
    AIAssistantName: { type: DataTypes.STRING, allowNull: true },
    stripeCustomerId: { type: DataTypes.STRING, allowNull: true },
    shouldUpdateChatbotSystemPrompt: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: { type: DataTypes.ENUM, values: ['active', 'suspended', 'cancelled'], defaultValue: 'active' },
    languageProtectedTerms: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    currency: { type: DataTypes.ENUM, values: [...Object.values(CurrencyCode)], defaultValue: CurrencyCode.LBP },
    reviewQuestions: { type: DataTypes.JSONB, defaultValue: [] },
    frequentlyAskedQuestions: { type: DataTypes.JSONB, defaultValue: [] },
    reviewTimer: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    modelName: ModelNames.Organizations,
    timestamps: true,
    indexes: [
      {
        fields: ['stripeCustomerId'],
      },
    ],
    hooks: {
      async beforeUpdate(org: any) {
        if (
          org.changed('AIAssistantName') ||
          org.changed('languageProtectedTerms') ||
          org.changed('name') ||
          org.changed('reviewQuestions')
        ) {
          org.shouldUpdateChatbotSystemPrompt = true;
        }
      },
    },
  }
);

export { OrganizationsModel };
