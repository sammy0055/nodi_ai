import {
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  DataTypes,
  Model,
} from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';
import { UserPermissionsModel } from './permission.model';

class UserRoleModel extends Model {
  public id!: string;
  public name!: string;
  public description!: string;

  declare setPermissions: BelongsToManySetAssociationsMixin<UserPermissionsModel, string>;
  declare addPermissions: BelongsToManyAddAssociationsMixin<UserPermissionsModel, string>;
  declare removePermission: BelongsToManyRemoveAssociationMixin<UserPermissionsModel, string>;
  declare removePermissions: BelongsToManyRemoveAssociationsMixin<UserPermissionsModel, string>;
  declare getPermissions: BelongsToManyGetAssociationsMixin<UserPermissionsModel>;

  static associate(models: DbModels) {
    this.belongsToMany(models.UsersModel, {
      through: 'user_roles',
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users',
    });

    this.belongsToMany(models.UserPermissionsModel, {
      through: 'role_permissions',
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions',
    });
  }
}

UserRoleModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, unique: true },
    description: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: ModelNames.UserRole,
    tableName: ModelNames.UserRole,
    timestamps: true,
  }
);

export { UserRoleModel };
