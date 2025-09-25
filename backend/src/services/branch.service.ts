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
    return await BranchesModel.update(branchWithoutId, { where: { id: id }, returning: true });
  }
  static async removeBranch(branchId: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!branchId) throw new Error('branch id param is required');
     if (!user.organizationId) throw new Error('organziation id is required');
    await BranchesModel.destroy({ where: { id: branchId } });
  }
  static async getBranch(branchId: string) {
    return await BranchesModel.findByPk(branchId);
  }
  static async getBranches(user: Pick<User, 'id' | 'organizationId'>, { offset, limit, page }: Pagination) {
    const { rows: branches, count: totalItems } = await BranchesModel.findAndCountAll({
      where: { organizationId: user.organizationId! },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
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
