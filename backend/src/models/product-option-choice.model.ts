import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ModelNames } from './model-names';
import { ProductOptionChoice } from '../types/product-option';

class ProductOptionChoiceModel
  extends Model<
    InferAttributes<ProductOptionChoiceModel>, // read attributes
    InferCreationAttributes<ProductOptionChoiceModel>
  >
  implements ProductOptionChoice
{
  declare id: CreationOptional<string>;
  declare productOptionId: string;
  declare label: string;
  declare priceAdjustment: number;
  declare isDefault: CreationOptional<boolean>;
  static associate(models: DbModels) {
    this.belongsTo(models.SubscriptionsModel, {
      foreignKey: 'productOptionId',
      as: 'productOption',
    });
  }
}
ProductOptionChoiceModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    productOptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.ProductOptions,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    label: { type: DataTypes.STRING, allowNull: false, comment: `"Small", "No Salt", "Extra Cheese"` },
    priceAdjustment: { type: DataTypes.DECIMAL(10, 2), allowNull: true, comment: '+2.50, -1.00, or 0' },
    isDefault: { type: DataTypes.BOOLEAN, defaultValue: false, comment: 'pre-selected option' },
  },
  {
    sequelize,
    modelName: ModelNames.ProductOptionChoices,
    indexes: [
      {
        fields: ['productOptionId'],
      },
    ],
  }
);

export { ProductOptionChoiceModel };
