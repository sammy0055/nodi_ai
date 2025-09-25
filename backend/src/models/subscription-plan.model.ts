import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

import { ModelNames } from './model-names';
import { ISubscriptionPlan } from '../types/subscription-plan';

class SubscriptionPlanModel
  extends Model<
    InferAttributes<SubscriptionPlanModel>, // read attributes
    InferCreationAttributes<SubscriptionPlanModel>
  >
  implements ISubscriptionPlan
{
  declare id: CreationOptional<string>;
  declare stripePlanId: string;
  declare stripePlanPriceId: string;
  declare name: string;
  declare description: string;
  declare price: number;
  declare creditPoints: number;
  declare billing_cycle_days: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
  declare featues?: string[] | undefined;
}

SubscriptionPlanModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    stripePlanId: { type: DataTypes.STRING, allowNull: false },
    stripePlanPriceId: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    creditPoints: { type: DataTypes.INTEGER, allowNull: false, comment: 'Credit points allocated per cycle' },
    billing_cycle_days: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    featues: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  },
  { sequelize, modelName: ModelNames.SubscriptionPlans, timestamps: true }
);

export { SubscriptionPlanModel };
