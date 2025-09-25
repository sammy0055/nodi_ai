import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';
import { CreditTransactionTypes } from '../data/data-types';
import { CreditTransactionAttributes } from '../types/credit-transaction';

export class CreditTransactionsModel
  extends Model<InferAttributes<CreditTransactionsModel>, InferCreationAttributes<CreditTransactionsModel>>
  implements CreditTransactionAttributes
{
  declare id: CreationOptional<string>;
  declare organizationId: string; // NOT NULL
  declare subscriptionId: CreationOptional<string>;
  declare transactionType: `${CreditTransactionTypes}`;
  declare amount: number;
  declare description: CreationOptional<string>;

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

CreditTransactionsModel.init(
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
    transactionType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'credit_add, credit_use, credit_expire',
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: ModelNames.CreditTransactions,
    timestamps: true,
    indexes: [{ fields: ['organizationId'] }, { fields: ['subscriptionId'] }, { fields: ['transactionType'] }],
  }
);
