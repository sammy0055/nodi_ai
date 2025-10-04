import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';
import { IOrder, OrderSourceTypes, OrderStatusTypes } from '../types/order';

class OrderModel
  extends Model<
    InferAttributes<OrderModel>, // read attributes
    InferCreationAttributes<OrderModel>
  >
  implements IOrder
{
  declare id: CreationOptional<string>;
  declare organizationId: string;
  declare customerId: string;
  declare branchId: string;
  declare status: `${OrderStatusTypes}`;
  declare source: `${OrderSourceTypes}`;
  declare items: any[];
  declare subtotal: number;
  declare shippingAmount: number;
  declare deliveryCharge: number;
  declare discountAmount?: number | undefined;
  declare totalAmount: number;
  declare currency: string;
  declare deliveryAreaId?: string | undefined;
  declare deliveryAreaName?: string | undefined;
  declare deliveryZoneId?: string | undefined;
  declare deliveryZoneName?: string | undefined;
  declare deliveryTime?: Date | undefined;

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });

    this.belongsTo(models.CustomerModel, {
      foreignKey: 'customerId',
      as: 'customer',
    });

    this.belongsTo(models.BranchesModel, {
      foreignKey: 'branchId',
      as: 'branch',
    });
  }
}

OrderModel.init(
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
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Branches,
        key: 'id',
      },
    },
    source: {
      type: DataTypes.ENUM,
      values: [...Object.values(OrderSourceTypes)],
      defaultValue: OrderSourceTypes.CHATBOT,
    },
    status: {
      type: DataTypes.ENUM,
      values: [...Object.values(OrderStatusTypes)],
      defaultValue: OrderStatusTypes.PENDING,
    },
    items: { type: DataTypes.JSONB, allowNull: false },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('subtotal');
        return rawValue === null ? null : parseFloat(rawValue as any);
      },
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('shippingAmount');
        return rawValue === null ? null : parseFloat(rawValue as any);
      },
    },
    deliveryCharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('deliveryCharge');
        return rawValue === null ? null : parseFloat(rawValue as any);
      },
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      get() {
        const rawValue = this.getDataValue('discountAmount');
        return rawValue === null ? null : parseFloat(rawValue as any);
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('totalAmount');
        return rawValue === null ? null : parseFloat(rawValue as any);
      },
    },
    currency: { type: DataTypes.STRING, defaultValue: 'USD' },
    deliveryAreaId: { type: DataTypes.STRING, allowNull: true },
    deliveryAreaName: { type: DataTypes.STRING, allowNull: true },
    deliveryZoneId: { type: DataTypes.STRING, allowNull: true },
    deliveryZoneName: { type: DataTypes.STRING, allowNull: true },
    deliveryTime: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: ModelNames.Orders, tableName: ModelNames.Orders, timestamps: true }
);

export { OrderModel };
