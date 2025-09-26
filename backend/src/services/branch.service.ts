import { Op, literal } from 'sequelize';
import { BranchesModel } from '../models/branches.model';
import { IBranch } from '../types/branch';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';

export class BranchService {
  static async createBranch(branch: Omit<IBranch, 'id'>, user: Pick<User, 'id' | 'organizationId'>) {
    return await BranchesModel.create({ ...branch, organizationId: user.organizationId! });
  }
  static async updateBranch(branch: IBranch, user: Pick<User, 'id' | 'organizationId'>) {
    const { id, ...branchWithoutId } = branch;
    if (!id) throw new Error('branch id param is required');
    if (!user.organizationId) throw new Error('organziation id is required');
    const [_, updatedRows] = await BranchesModel.update(branchWithoutId, { where: { id: id }, returning: true });
    const updatedProduct = updatedRows[0].get({ plain: true }); // plain JS object
    return updatedProduct;
  }
  static async removeBranch(branchId: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!branchId) throw new Error('branch id param is required');
    if (!user.organizationId) throw new Error('organziation id is required');
    await BranchesModel.destroy({ where: { id: branchId } });
  }
  static async getBranch(branchId: string) {
    return await BranchesModel.findByPk(branchId);
  }
  static async getBranches(
    user: Pick<User, 'id' | 'organizationId'>,
    { offset, limit, page }: Pagination,
    search?: string
  ) {
    let whereCondition: any = { organizationId: user.organizationId! };

    // If search term exists, add full-text search
    if (search && search.trim() !== '') {
      whereCondition = {
        ...whereCondition,
        [Op.and]: literal(`
        (
          setweight(to_tsvector('english', coalesce("Branches"."name", '')), 'A') ||
          setweight(to_tsvector('english', coalesce("Branches"."location", '')), 'B') ||
          setweight(to_tsvector('simple', coalesce("Branches"."email", '')), 'C') ||
          setweight(to_tsvector('simple', coalesce("Branches"."phone", '')), 'D')
        ) @@ plainto_tsquery('english', '${search}')
      `),
      };
    }

    const { rows: branches, count: totalItems } = await BranchesModel.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
      order: search
        ? [
            // sort by relevance if searching
            [
              literal(`
              ts_rank(
                (
                  setweight(to_tsvector('english', coalesce("Branches"."name", '')), 'A') ||
                  setweight(to_tsvector('english', coalesce("Branches"."location", '')), 'B') ||
                  setweight(to_tsvector('simple', coalesce("Branches"."email", '')), 'C') ||
                  setweight(to_tsvector('simple', coalesce("Branches"."phone", '')), 'D')
                ),
                plainto_tsquery('english', '${search}')
              )
            `),
              'DESC',
            ],
          ]
        : [['createdAt', 'DESC']],
    });

    // prepare pagination info
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: branches,
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
