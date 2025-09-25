import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { WhatSappConnectionStatus } from '../data/data-types';
import { IWhatSappSettings } from '../types/whatsapp-settings';
import { encrypt } from '../utils/crypto-utils';
import { ModelNames } from './model-names';

class WhatSappSettingsModel
  extends Model<InferAttributes<WhatSappSettingsModel>, InferCreationAttributes<WhatSappSettingsModel>>
  implements IWhatSappSettings
{
  declare id: CreationOptional<string>;
  declare organizationId: string | null;
  declare whatsappBusinessId: string;
  declare whatsappPhoneNumberIds: string[];
  declare connectionStatus: `${WhatSappConnectionStatus}`;
  declare accessToken: string | null;
  declare token_type: string | null;
  declare isSubscribedToWebhook: boolean;
  declare whatsappTemplates: CreationOptional<string[]>;
  declare catalogId: CreationOptional<string>;
  static associate(models: DbModels) {
    // belongsTo → The foreign key is on this model (the one calling belongsTo).
    // A WABA belongs to one organization (employee/staff)
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });
  }
}

WhatSappSettingsModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: ModelNames.Organizations,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    whatsappBusinessId: { type: DataTypes.STRING, allowNull: false },
    whatsappPhoneNumberIds: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
    connectionStatus: {
      type: DataTypes.ENUM,
      values: Object.values(WhatSappConnectionStatus),
      defaultValue: 'not-connected',
    },
    accessToken: { type: DataTypes.STRING, allowNull: true },
    token_type: { type: DataTypes.STRING, allowNull: true },
    isSubscribedToWebhook: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    whatsappTemplates: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
    catalogId: { type: DataTypes.STRING, defaultValue: '' },
  },
  {
    sequelize,
    tableName: ModelNames.Whatsappsettings,
    timestamps: true,
    indexes: [
      {
        fields: ['organizationId'],
      },
    ],
    hooks: {
      async beforeCreate(whsatsappBusinessAccount: IWhatSappSettings) {
        if (whsatsappBusinessAccount.accessToken) {
          whsatsappBusinessAccount.accessToken = encrypt(whsatsappBusinessAccount.accessToken);
        }
      },
      async beforeUpdate(whsatsappBusinessAccount: any) {
        if (whsatsappBusinessAccount.changed('accessToken')) {
          whsatsappBusinessAccount.accessToken = encrypt(whsatsappBusinessAccount.accessToken);
        }
      },
    },
  }
);

export { WhatSappSettingsModel };
