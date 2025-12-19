import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';

class UserPermissionsModel extends Model {
  public id!: string;
  public key!: string;
  public description!: string;

  static associate(models: DbModels) {
    this.belongsToMany(models.UserRoleModel, {
      through: 'role_permissions',
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      as: 'roles',
    });
  }
}

UserPermissionsModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    key: { type: DataTypes.STRING, unique: true }, // order.create
    description: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: ModelNames.UserPermissions,
    tableName: ModelNames.UserPermissions,
    timestamps: true,
  }
);

export { UserPermissionsModel };
