import { Op, literal } from 'sequelize';
import { BranchInventoryModel } from '../models/branch-inventory.model';
import { BranchesModel } from '../models/branches.model';
import { ProductModel } from '../models/products.model';
import { IBranchInventory } from '../types/branch-inventory';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';

export class BranchInventoryService {
  static async createInventory(data: IBranchInventory, user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.organizationId) throw new Error('organization ID is required');

    const { isAllProductSelected, isAllBranchSelected, productId, branchId, ...rest } = data;

    const inserts: IBranchInventory[] = [];

    // case 1: single product + single branch
    if (!isAllProductSelected && !isAllBranchSelected) {
      inserts.push({
        ...rest,
        productId,
        branchId,
        organizationId: user.organizationId,
      });
    }

    // case 2: one branch + all products
    if (isAllProductSelected && !isAllBranchSelected) {
      const products = await ProductModel.findAll({
        where: { organizationId: user.organizationId },
        attributes: ['id'],
      });
      if (!products.length) throw new Error('no product in organization');

      for (const p of products) {
        inserts.push({
          ...rest,
          branchId,
          productId: p.id,
          sellingPrice: p.price,
          organizationId: user.organizationId,
        });
      }
    }

    // case 3: all branches + all products
    if (isAllProductSelected && isAllBranchSelected) {
      const products = await ProductModel.findAll({
        where: { organizationId: user.organizationId },
        attributes: ['id'],
      });
      const branches = await BranchesModel.findAll({
        where: { organizationId: user.organizationId },
        attributes: ['id'],
      });

      if (!products.length) throw new Error('no product in organization');
      if (!branches.length) throw new Error('no branch in organization');

      for (const b of branches) {
        for (const p of products) {
          inserts.push({
            ...rest,
            branchId: b.id,
            productId: p.id,
            sellingPrice: p.price,
            organizationId: user.organizationId,
          });
        }
      }
    }

    // case 4: all branches + one product
    if (!isAllProductSelected && isAllBranchSelected) {
      const branches = await BranchesModel.findAll({
        where: { organizationId: user.organizationId },
        attributes: ['id'],
      });

      for (const b of branches) {
        inserts.push({
          ...rest,
          branchId: b.id,
          productId,
          organizationId: user.organizationId,
        });
      }
    }

    // create all at once
    await BranchInventoryModel.bulkCreate(inserts as any, { ignoreDuplicates: true });

    // return newly created inventories
    return await BranchInventoryModel.findAll({
      where: { organizationId: user.organizationId },
      include: [
        { model: ProductModel, as: 'product', attributes: ['id', 'name', 'currency'] },
        { model: BranchesModel, as: 'branch', attributes: ['id', 'name'] },
      ],
    });
  }

  // static async createInventories(data: IBranchInventory, user: Pick<User, 'id' | 'organizationId'>) {
  //   if (!user.organizationId) throw new Error('organization ID is required');

  //   const { isAllProductSelected, isAllBranchSelected, ...rest } = data;
  //   const inserts: IBranchInventory[] = [];

  //   // one branch + all products
  //   if (isAllProductSelected) {
  //     const products = await ProductModel.findAll({
  //       where: { organizationId: user.organizationId },
  //       attributes: ['id'],
  //     });

  //     if (!products.length) throw new Error('no product in organization');

  //     for (const p of products) {
  //       inserts.push({
  //         ...rest,
  //         productId: p.id,
  //         organizationId: user.organizationId,
  //       });
  //     }
  //   }

  //   // all branches + all products
  //   if (isAllProductSelected && isAllBranchSelected) {
  //     const products = await ProductModel.findAll({
  //       where: { organizationId: user.organizationId },
  //       attributes: ['id'],
  //     });
  //     const branches = await BranchesModel.findAll({
  //       where: { organizationId: user.organizationId },
  //       attributes: ['id'],
  //     });

  //     if (!products.length) throw new Error('no product in organization');
  //     if (!branches.length) throw new Error('no branch in organization');

  //     for (const b of branches) {
  //       for (const p of products) {
  //         inserts.push({
  //           ...rest,
  //           branchId: b.id,
  //           productId: p.id,
  //           organizationId: user.organizationId,
  //         });
  //       }
  //     }
  //   }

  //   // create all at once
  //   await BranchInventoryModel.bulkCreate(inserts as any);

  //   // now return all created inventory with related data
  //   const inventories = await BranchInventoryModel.findAll({
  //     where: { organizationId: user.organizationId },
  //     include: [
  //       { model: ProductModel, as: 'product', attributes: ['id', 'name', 'currency'] },
  //       { model: BranchesModel, as: 'branch', attributes: ['id', 'name'] },
  //     ],
  //   });

  //   return inventories;
  // }

  static async updateInventory(data: IBranchInventory, user: Pick<User, 'id' | 'organizationId'>) {
    if (!data.id) throw new Error('inventory ID is required');
    const [_, updatedRows] = await BranchInventoryModel.update(data, { where: { id: data.id }, returning: true });
    const updatedProduct = updatedRows[0].get({ plain: true }); // plain JS object
    return updatedProduct;
  }

  static async deleteInventory(inventoryId: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!inventoryId) throw new Error('inventory ID is required');
    if (!user.organizationId) throw new Error('you need to be part of an organization to perform this action');
    await BranchInventoryModel.destroy({ where: { id: inventoryId } });
  }

  static async getBranchInventories(
    user: Pick<User, 'id' | 'organizationId'>,
    { offset, limit, page }: Pagination,
    search?: string
  ) {
    const { rows: inventories, count: totalItems } = await BranchInventoryModel.findAndCountAll({
      where: {
        organizationId: user.organizationId!,
        ...(search && search.trim() !== ''
          ? {
              [Op.and]: [
                {
                  [Op.or]: [
                    literal(`
                  to_tsvector('english', coalesce("product"."name", ''))
                  @@ plainto_tsquery('english', '${search}')
                `),
                    literal(`
                  to_tsvector('english', coalesce("branch"."name", ''))
                  @@ plainto_tsquery('english', '${search}')
                `),
                  ],
                },
              ],
            }
          : {}),
      },
      include: [
        {
          model: ProductModel,
          as: 'product',
          attributes: ['id', 'name', 'currency'],
        },
        {
          model: BranchesModel,
          as: 'branch',
          attributes: ['id', 'name'],
        },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: inventories,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
