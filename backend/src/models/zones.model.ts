import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { IZone } from '../types/zone';
import { ModelNames } from './model-names';

class ZoneModel extends Model<InferAttributes<ZoneModel>, InferCreationAttributes<ZoneModel>> implements IZone {
  declare id: string;
  declare organizationId: string;
  declare name: string;
  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });
  }
}

ZoneModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Organizations,
        key: 'id',
      },
      onDelete: 'CASCADE', // or 'RESTRICT' depending on your rules
      onUpdate: 'CASCADE',
    },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: ModelNames.Zones, timestamps: true }
);

export { ZoneModel };
