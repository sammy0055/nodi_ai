import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { IBranch } from '../types/branch';
import { ModelNames } from './model-names';

class BranchesModel
  extends Model<
    InferAttributes<BranchesModel>, // read attributes
    InferCreationAttributes<BranchesModel>
  >
  implements IBranch
{
  declare id: CreationOptional<string>;
  declare organizationId: string;
  declare name: string;
  declare code: CreationOptional<string | undefined>;
  declare phone: string;
  declare email: string;
  declare isActive: CreationOptional<boolean>;
  declare location: string;
  declare supportsDelivery: boolean;
  declare supportsTakeAway: boolean;
  declare deliveryTime: Date;
  declare takeAwayTime: Date;
  static associate(models: DbModels) {
    // A branch belongs to one organization
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });

    // link to branch inventory
    this.hasMany(models.BranchInventoryModel, {
      foreignKey: 'branchId',
      as: 'branchInventory',
    });

    // link to deliver areas
    this.hasMany(models.AreaModel, {
      foreignKey: 'branchId',
      as: 'deliverAreas',
    });
  }
}

BranchesModel.init(
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
    code: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    location: { type: DataTypes.STRING, allowNull: false },
    deliveryTime: { type: DataTypes.DATE, allowNull: true },
    takeAwayTime: { type: DataTypes.DATE, allowNull: true },
    supportsDelivery: { type: DataTypes.DATE, allowNull: false },
    supportsTakeAway: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: ModelNames.Branches,
    timestamps: true,
    indexes: [
      {
        fields: ['organizationId'],
      },
    ],
  }
);

export { BranchesModel };
