import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';
import { CustomerSourceTypes, ICustomer } from '../types/customers';
class CustomerModel
  extends Model<
    InferAttributes<CustomerModel>, // read attributes
    InferCreationAttributes<CustomerModel>
  >
  implements ICustomer
{
  declare id: CreationOptional<string>;
  declare organizationId: string;
  declare name: string;
  declare phone: string;
  declare preferences?: Record<string, any> | undefined;
  declare source: 'chatbot' | 'website' | 'mobile_app' | 'api';

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });
  }
}

CustomerModel.init(
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
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    source: {
      type: DataTypes.ENUM,
      values: [...Object.values(CustomerSourceTypes)],
      defaultValue: CustomerSourceTypes.CHATBOT,
    },
    preferences: { type: DataTypes.JSONB, allowNull: true },
  },
  { sequelize, modelName: ModelNames.Customers, tableName: ModelNames.Customers, timestamps: true }
);

export { CustomerModel };
