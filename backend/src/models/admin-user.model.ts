import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from './db';
import { ModelNames } from './model-names';
import { AdminUser } from '../types/users';

class AdminUserModel
  extends Model<
    InferAttributes<AdminUserModel>, // read attributes
    InferCreationAttributes<AdminUserModel>
  >
  implements AdminUser
{
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare password: string;
  declare type: 'admin';

  // custom method
  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}

AdminUserModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('admin'), allowNull: false, defaultValue: 'admin' },
  },
  {
    sequelize,
    modelName: ModelNames.AdminUser,
    timestamps: true,
    indexes: [
      {
        fields: ['id'],
      },
    ],
    hooks: {
      async beforeCreate(user: any) {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      async beforeUpdate(user: any) {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export { AdminUserModel };
