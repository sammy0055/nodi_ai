import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';
import { SubstriptionStatusTypes } from '../data/data-types';
import { ISubscription } from '../types/subscription';

class SubscriptionsModel
  extends Model<
    InferAttributes<SubscriptionsModel>, // read attributes
    InferCreationAttributes<SubscriptionsModel>
  >
  implements ISubscription
{
  declare id: CreationOptional<string>;
  declare organizationId?: string | null | undefined;
  declare planId: string;
  declare status: `${SubstriptionStatusTypes}`;
  declare startDate: Date;
  declare currentPeriodStart: Date;
  declare currentPeriodEnd: Date;
  declare nextBillingDate: Date;
  declare cancelAtPeriodEnd: CreationOptional<boolean>;

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });
  }
}

SubscriptionsModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: ModelNames.Organizations,
        key: 'id',
      },
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
    planId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.SubscriptionPlans,
        key: 'id',
      },
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: [...Object.values(SubstriptionStatusTypes)],
      defaultValue: SubstriptionStatusTypes.active,
    },
    startDate: { type: DataTypes.DATE, allowNull: false },
    currentPeriodStart: { type: DataTypes.DATE, allowNull: false },
    currentPeriodEnd: { type: DataTypes.DATE, allowNull: false },
    nextBillingDate: { type: DataTypes.DATE, allowNull: false },
    cancelAtPeriodEnd: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: ModelNames.Subscriptions,
    timestamps: true,
    indexes: [
      {
        fields: ['organizationId'],
      },
    ],
  }
);

export {SubscriptionsModel}