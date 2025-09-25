import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';
import { CreditBalanceAttributes } from '../types/creditBalance';


class CreditBalanceModel
  extends Model<
    InferAttributes<CreditBalanceModel>, // read attributes
    InferCreationAttributes<CreditBalanceModel>
  >
  implements CreditBalanceAttributes
{
  declare id: CreationOptional<string>;
  declare organizationId: CreationOptional<string>;
  declare totalCredits: CreationOptional<number>;
  declare usedCredits: CreationOptional<number>;
  declare remainingCredits: CreationOptional<number>;

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });
  }
}
CreditBalanceModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: ModelNames.Organizations,
        key: 'id',
      },
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
    totalCredits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    usedCredits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    remainingCredits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: ModelNames.CreditBalance,
    timestamps: true,
    indexes: [
      {
        fields: ['organizationId'],
      },
    ],
  }
);

export { CreditBalanceModel };