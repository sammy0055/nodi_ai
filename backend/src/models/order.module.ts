import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, literal } from 'sequelize';
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
  declare title?: string;
  declare organizationId: string;
  declare customerId: string;
  declare branchId: string;
  declare status: `${OrderStatusTypes}`;
  declare source: `${OrderSourceTypes}`;
  declare items: any[];
  declare subtotal: number;
  declare deliveryCharge: number;
  declare discountAmount?: number | undefined;
  declare totalAmount: number;
  declare currency: string;
  declare deliveryAreaId: string;
  declare deliveryAreaName?: string | undefined;
  declare deliveryZoneId?: string | undefined;
  declare deliveryZoneName?: string | undefined;
  declare deliveryTime?: Date | undefined;
  declare shippingAddress: string | null;
  declare serviceType: 'delivery' | 'takeaway';
  declare searchVector?: any;

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

    this.belongsTo(models.AreaModel, {
      foreignKey: 'deliveryAreaId',
      as: 'area',
    });
  }
}

OrderModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
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
    deliveryAreaId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Areas,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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
    currency: { type: DataTypes.STRING, allowNull: false },
    shippingAddress: { type: DataTypes.STRING, allowNull: false },
    serviceType: { type: DataTypes.ENUM('delivery', 'takeaway'), allowNull: false },
    deliveryAreaName: { type: DataTypes.STRING, allowNull: true },
    deliveryTime: { type: DataTypes.DATE, allowNull: true },
    searchVector: {
      type: 'TSVECTOR',
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: ModelNames.Orders,
    tableName: ModelNames.Orders,
    timestamps: true,
    indexes: [
      {
        name: 'order_search_idx',
        fields: ['searchVector'],
        using: 'GIN',
      },
    ],
    hooks: {
      beforeSave: async (order: any) => {
        const searchText = [
          order.id,
          order.branchId,
          (order as any).customerId, // if you store name here
        ]
          .filter(Boolean)
          .join(' ');
        const escapedText = searchText.replace(/'/g, "''");
        order.setDataValue('searchVector', literal(`to_tsvector('english', '${escapedText}')`));
      },
    },
  }
);

export { OrderModel };
