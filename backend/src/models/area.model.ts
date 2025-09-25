import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { IArea } from '../types/area';
import { BranchesModel } from './branches.model';
import { ModelNames } from './model-names';

class AreaModel extends Model<InferAttributes<AreaModel>, InferCreationAttributes<AreaModel>> implements IArea {
  declare id: CreationOptional<string>;
  declare organizationId: string;
  declare name: string;
  declare branchId: string;
  declare zoneId: string;
  declare deliveryTime: Date;
  declare deliveryCharge: number;

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });

    this.belongsTo(models.BranchesModel, {
      foreignKey: 'branchId',
      as: 'branch',
    });

    this.belongsTo(models.ZoneModel, {
      foreignKey: 'zoneId',
      as: 'zone',
    });
  }
}
AreaModel.init(
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
    zoneId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Zones,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Branches,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    name: { type: DataTypes.STRING, allowNull: false },
    deliveryTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'time of deivery for this area. can overide, deliverytime on branch',
    },
    deliveryCharge: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: ModelNames.Areas,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['zoneId', 'branchId'],
      },
      {
        fields: ['organizationId'],
      },
    ],
    hooks: {
      async beforeCreate(area: IArea) {
        if (area.deliveryTime) {
          await BranchesModel.update({ deliveryTime: area.deliveryTime }, { where: { id: area.branchId } });
        }
      },

      async beforeUpdate(area: IArea) {
        if (area.deliveryTime) {
          await BranchesModel.update({ deliveryTime: area.deliveryTime }, { where: { id: area.branchId } });
        }
      },
    },
  }
);

export { AreaModel };
