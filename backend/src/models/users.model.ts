import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  BelongsToManyAddAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
} from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';
import { UserRoleModel } from './role.model';

class UsersModel extends Model<
  InferAttributes<UsersModel>, // read attributes
  InferCreationAttributes<UsersModel> // creation attributes
> {
  declare id: CreationOptional<string>;
  declare organizationId: string | null;
  declare name: string;
  declare email: string;
  declare password: string;
  declare resetToken: string | null;
  declare resetTokenExpires: Date | null;
  declare status?: 'active' | 'suspended';
  activeOrderCount?: number;
  maxConcurrentOrders?: number;
  isActive?: boolean;
  lastActive?: Date;

  declare addRole: BelongsToManyAddAssociationsMixin<UserRoleModel, string>;
  declare setRoles: BelongsToManySetAssociationsMixin<UserRoleModel, string>;
  declare removeRole: BelongsToManyRemoveAssociationMixin<UserRoleModel, string>;
  declare removeRoles: BelongsToManyRemoveAssociationsMixin<UserRoleModel, string>;

  // custom method
  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  static associate(models: DbModels) {
    // belongsTo → The foreign key is on this model (the one calling belongsTo).
    // A user belongs to one organization (employee/staff)
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });

    // hasOne → The foreign key is on the other model (the one being linked).
    // A user can also own an organization (special role)
    this.hasOne(models.OrganizationsModel, {
      foreignKey: 'ownerId',
      as: 'ownedOrganization',
    });

    this.belongsToMany(models.UserRoleModel, {
      through: 'user_roles',
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles',
    });
  }
}

UsersModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: ModelNames.Organizations,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: true, defaultValue: 'active' },
    activeOrderCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    maxConcurrentOrders: { type: DataTypes.INTEGER, defaultValue: 100 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    lastActive: { type: DataTypes.DATE, defaultValue: Date.now() },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: ModelNames.Users,
    tableName: ModelNames.Users,
    timestamps: true,
    indexes: [
      {
        fields: ['id'], // index on id (though primary key is already indexed by default)
      },
      {
        fields: ['organizationId'], // index on organizationId for faster lookups
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

export { UsersModel };
