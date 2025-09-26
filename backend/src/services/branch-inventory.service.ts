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
    return await BranchInventoryModel.create({ ...data, organizationId: user.organizationId });
  }

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
          attributes: ['id', 'name'],
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
