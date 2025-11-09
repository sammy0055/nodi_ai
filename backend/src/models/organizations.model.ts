import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { BusinessType, supportedBusinessTypes } from '../data/data-types';
import { ModelNames } from './model-names';
import { IOrganization } from '../types/organization';

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
  declare languageProtectedTerms?: string | undefined;
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
    shouldUpdateChatbotSystemPrompt: { type: DataTypes.BOOLEAN, defaultValue: true },
    status: { type: DataTypes.ENUM, values: ['active', 'suspended', 'cancelled'], defaultValue: 'active' },
    languageProtectedTerms: { type: DataTypes.STRING, defaultValue: '' },
  },
  {
    sequelize,
    modelName: ModelNames.Organizations,
    timestamps: true,
    indexes: [
      {
        fields: ['stripeCustomerId'],
      },
      // ✅ new full-text search index
      // {
      //   name: 'organizations_text_search_idx',
      //   using: 'GIN',
      //   fields: [
      //     sequelize.literal(`
      //       to_tsvector(
      //         'english',
      //         coalesce("id"::text, '') || ' ' ||
      //         coalesce("name", '') || ' ' ||
      //     `),
      //   ],
      // },
    ],
    hooks: {
      beforeUpdate: async (org: IOrganization) => {
        org.shouldUpdateChatbotSystemPrompt = true;
      },
    },
  }
);

export { OrganizationsModel };
