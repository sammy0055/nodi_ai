import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { DbModels } from '.';
import { IBranchInventory } from '../types/branch-inventory';
import { ProductModel } from './products.model';
import { ModelNames } from './model-names';

class BranchInventoryModel
  extends Model<InferAttributes<BranchInventoryModel>, InferCreationAttributes<BranchInventoryModel>>
  implements IBranchInventory
{
  declare id: string;
  declare organizationId: string;
  declare branchId: string;
  declare productId: string;
  declare quantityOnHand?: CreationOptional<number | undefined>;
  declare quantityReserved?: CreationOptional<number | undefined>;
  declare costPrice?: CreationOptional<number | undefined>;
  declare sellingPrice: number;
  declare isActive: boolean;

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'organization',
    });

    this.belongsTo(models.BranchesModel, {
      foreignKey: 'branchId',
      as: 'branch',
    });

    this.belongsTo(models.ProductModel, {
      foreignKey: 'productId',
      as: 'product',
    });
  }
}

BranchInventoryModel.init(
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
    quantityOnHand: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'The current number of units physically available in stock',
    },
    quantityReserved: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'The number of units set aside for pending orders or reservations',
    },
    costPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'The cost price per unit for this branch’s stock of the product',
    },
    sellingPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: `The selling price per unit for this branch’s stock (can override product price)`,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this product is actively sold in this branch',
    },
  },
  {
    sequelize,
    modelName: ModelNames.BranchInventory,
    indexes: [
      {
        unique: true, // 🔑 ensures uniqueness
        fields: ['branchId', 'productId'],
        name: 'unique_product_per_branch_inventory',
      },
      {
        fields: ['organizationId'], // speeds up queries by org
        name: 'idx_inventory_org',
      },
    ],
    hooks: {
      async beforeCreate(inventory: IBranchInventory) {
        if (inventory.sellingPrice) {
          await ProductModel.update({ price: inventory.sellingPrice }, { where: { id: inventory.organizationId } });
        }
      },
      async beforeUpdate(inventory: IBranchInventory) {
        if (inventory.sellingPrice) {
          await ProductModel.update({ price: inventory.sellingPrice }, { where: { id: inventory.organizationId } });
        }
      },
    },
  }
);

export { BranchInventoryModel };
