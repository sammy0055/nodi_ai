import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { ProductStatusTypes } from '../data/data-types';
import { IProduct } from '../types/product';
import { ModelNames } from './model-names';
import { ManageVectorStore } from '../helpers/vector-store';

class ProductModel
  extends Model<
    InferAttributes<ProductModel>, // read attributes
    InferCreationAttributes<ProductModel>
  >
  implements IProduct
{
  declare id: CreationOptional<string>;
  declare sku: CreationOptional<string>;
  declare organizationId: string;
  declare name: string;
  declare price: number;
  declare description: string;
  declare currency: CreationOptional<string>;
  declare imageUrl: CreationOptional<string>;
  declare metaProductId: string;
  declare status: CreationOptional<`${ProductStatusTypes}`>;
  declare filePath: CreationOptional<string>;
  declare embedding?: number[] | undefined;

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });

    this.hasMany(models.BranchInventoryModel, {
      foreignKey: 'productId',
      as: 'branchInventory',
    });
  }
}

ProductModel.init(
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
    sku: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    name: { type: DataTypes.STRING, allowNull: false },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('price');
        return rawValue === null ? null : parseFloat(rawValue as any);
      },
    },
    description: { type: DataTypes.STRING, allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'USD' },
    imageUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
    filePath: { type: DataTypes.STRING, allowNull: true, defaultValue: '', comment: 'path to superbase storage' },
    metaProductId: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM,
      values: [...Object.values(ProductStatusTypes)],
      defaultValue: ProductStatusTypes.ACTIVE,
    },
  },
  {
    sequelize,
    modelName: ModelNames.Products,
    tableName: ModelNames.Products,
    timestamps: true,
    indexes: [
      {
        fields: ['organizationId', 'sku'],
      },
      {
        name: 'product_search_idx',
        using: 'GIN',
        fields: [sequelize.literal(`to_tsvector('english', coalesce("name",'') || ' ' || coalesce("description",''))`)],
      },
    ],
    hooks: {
      beforeCreate: async (product: ProductModel) => {
        const vectorStore = new ManageVectorStore();
        await vectorStore.insertProductEmbedding(product);
      },
      beforeUpdate: async (product: ProductModel) => {
        const vectorStore = new ManageVectorStore();
        await vectorStore.insertProductEmbedding(product);
      },
    },
  }
);

export { ProductModel };
