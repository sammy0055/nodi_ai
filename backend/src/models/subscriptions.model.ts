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
  declare organizationId: string | null | undefined;
  declare planId: string;
  declare status: `${SubstriptionStatusTypes}`;
  declare startDate: Date;
  declare currentPeriodStart: Date;
  declare currentPeriodEnd: Date | null;
  declare nextBillingDate: Date | null;
  declare cancelAtPeriodEnd: CreationOptional<boolean>;
  declare subscriptionId: string;
  declare customerId: string;

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });

    this.belongsTo(models.SubscriptionPlanModel, {
      foreignKey: 'planId',
      as: 'plan',
    });
  }
}

SubscriptionsModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
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
    subscriptionId: { type: DataTypes.STRING, allowNull: false },
    customerId: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: [...Object.values(SubstriptionStatusTypes)],
      defaultValue: SubstriptionStatusTypes.active,
    },
    startDate: { type: DataTypes.DATE, allowNull: false },
    currentPeriodStart: { type: DataTypes.DATE, allowNull: false },
    currentPeriodEnd: { type: DataTypes.DATE, allowNull: true },
    nextBillingDate: { type: DataTypes.DATE, allowNull: true },
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
      {
        fields: ['subscriptionId'],
      },
    ],
  }
);

export { SubscriptionsModel };
