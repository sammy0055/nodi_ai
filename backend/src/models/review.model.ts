import { DataTypes, Model, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';

export interface IReview {
  id: CreationOptional<string>;
  organizationId: string;
  customerId: string;
  orderId: string;
  rating: number;
}

class ReviewModel extends Model implements IReview {
  public id!: CreationOptional<string>;
  public organizationId!: string;
  public customerId!: string;
  public orderId!: string;
  public rating!: number;
  public comment!: string;

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });

    this.belongsTo(models.CustomerModel, {
      foreignKey: 'customerId',
      as: 'customer',
    });

    this.belongsTo(models.OrderModel, {
      foreignKey: 'orderId',
      as: 'order',
    });
  }
}

ReviewModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Organizations,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Customers,
        key: 'id',
      },
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Orders,
        key: 'id',
      },
    },
    rating: { type: DataTypes.INTEGER, defaultValue: 0 },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: ModelNames.Reviews,
    tableName: ModelNames.Reviews,
    timestamps: true,

    indexes: [
      // Search by customerId
      {
        name: 'review_customer_idx',
        fields: ['customerId'],
      },
      // Search by orderId
      {
        name: 'review_order_idx',
        fields: ['orderId'],
      },
    ],
  }
);

export { ReviewModel };
