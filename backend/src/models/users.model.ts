import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from './db';
import { DbModels } from '.';
import { UserTypes } from '../data/data-types';
import { ModelNames } from './model-names';

class UsersModel extends Model<
  InferAttributes<UsersModel>, // read attributes
  InferCreationAttributes<UsersModel> // creation attributes
> {
  declare id: CreationOptional<string>;
  declare organizationId: string | null;
  declare name: string;
  declare email: string;
  declare password: string;
  declare userType: `${UserTypes}`;

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
    userType: { type: DataTypes.ENUM, values: Object.values(UserTypes), defaultValue: 'owner' },
  },
  {
    sequelize,
    modelName: ModelNames.Users,
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
