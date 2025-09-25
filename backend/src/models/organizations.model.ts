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
  static associate(models: DbModels) {
    //hasMany The foreign key is on the other model (the one being linked).
    this.hasMany(models.BranchesModel, { foreignKey: 'organizationId' });

    // Organization has many users
    this.hasMany(models.UsersModel, {
      foreignKey: 'organizationId',
      as: 'users',
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

    // belongsTo → The foreign key is on this model (the one calling belongsTo).
    // Organization has one owner
    this.belongsTo(models.UsersModel, {
      foreignKey: 'ownerId',
      as: 'owner',
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
        model: 'Users',
        key: 'id',
      },
    }, // special owner link
    name: { type: DataTypes.STRING, allowNull: false },
    businessType: { type: DataTypes.ENUM, values: supportedBusinessTypes },
    brandTone: { type: DataTypes.STRING, defaultValue: '' },
    AIAssistantName: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: ModelNames.Organizations, timestamps: true }
);

export { OrganizationsModel };
