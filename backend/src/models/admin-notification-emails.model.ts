import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from './db';
import { ModelNames } from './model-names';

export interface AdminEmailListAttributes {
  id?: string | null;
  email: string;
  status: 'verified' | 'pending';
  verificationCode?: string | null;
  codeExpiresAt?: Date | null;
}

class AdminEmailListModel
  extends Model<InferAttributes<AdminEmailListModel>, InferCreationAttributes<AdminEmailListModel>>
  implements AdminEmailListAttributes
{
  declare id?: string | null;
  declare email: string;
  declare status: 'verified' | 'pending';
  declare verificationCode?: string | null;
  declare codeExpiresAt?: Date | null;
}

AdminEmailListModel.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('verified', 'pending'),
      defaultValue: 'pending',
    },
    verificationCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    codeExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: ModelNames.AdminEmailList,
    tableName: ModelNames.AdminEmailList,
  }
);

export { AdminEmailListModel };
