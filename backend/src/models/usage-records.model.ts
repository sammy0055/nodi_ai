import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';
import { UsageRecordAttributes } from '../types/usage-record';

class UsageRecordModel
  extends Model<InferAttributes<UsageRecordModel>, InferCreationAttributes<UsageRecordModel>>
  implements UsageRecordAttributes
{
  declare id: CreationOptional<string>;
  declare organizationId: string;
  declare subscriptionId: string;
  declare featureName: string;
  declare creditsConsumed: number;
  declare metadata: any;

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });

    this.belongsTo(models.SubscriptionsModel, {
      foreignKey: 'subscriptionId',
      as: 'subscription',
    });
  }
}
UsageRecordModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Organizations,
        key: 'id',
      },
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: ModelNames.Subscriptions,
        key: 'id',
      },
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
    featureName: { type: DataTypes.STRING(100), allowNull: false },
    creditsConsumed: { type: DataTypes.INTEGER, allowNull: false },
    metadata: { type: DataTypes.JSONB, allowNull: true },
  },
  {
    sequelize,
    modelName: ModelNames.UsageRecords,
    timestamps: true,

    indexes: [
      {
        fields: ['organizationId'],
      },
    ],
  }
);

export { UsageRecordModel };
