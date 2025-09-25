import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ProductOptionTypes } from '../data/data-types';
import { ModelNames } from './model-names';
import { ProductOption } from '../types/product-option';

class ProductOptionModel
  extends Model<
    InferAttributes<ProductOptionModel>, // read attributes
    InferCreationAttributes<ProductOptionModel>
  >
  implements ProductOption
{
  declare id: CreationOptional<string>;
  declare productId: string;
  declare name: string;
  declare type: `${ProductOptionTypes}`;
  declare isRequired: CreationOptional<boolean>;
  declare minSelection: CreationOptional<number>;
  declare maxSelection: CreationOptional<number>;

  static associate(models: DbModels) {
    this.hasMany(models.ProductOptionChoiceModel, {
      foreignKey: 'productOptionId',
      as: 'choices',
    });
  }
}

ProductOptionModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Products,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM, values: [...Object.values(ProductOptionTypes)] },
    isRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
    minSelection: { type: DataTypes.INTEGER, defaultValue: 1 },
    maxSelection: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    sequelize,
    modelName: ModelNames.ProductOptions,
    indexes: [
      {
        fields: ['productId'],
      },
    ],
  }
);

export { ProductOptionModel };
