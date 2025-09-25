import { BranchService } from '../services/branch.service';
import { IBranch } from '../types/branch';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';

export class BranchController {
  static async createBranch(branch: Omit<IBranch, 'id'>, user: Pick<User, 'id' | 'organizationId'>) {
    return await BranchService.createBranch(branch, user);
  }
  static async updateBranch(branch: IBranch, user: Pick<User, 'id' | 'organizationId'>) {
    return await BranchService.updateBranch(branch, user);
  }
  static async removeBranch(branchId: string, user: Pick<User, 'id' | 'organizationId'>) {
    await BranchService.removeBranch(branchId, user);
  }
  static async getBranch(branchId: string) {
    return await BranchService.getBranch(branchId);
  }
  static async getBranches(user: Pick<User, 'id' | 'organizationId'>, pagination: Pagination) {
    return await BranchService.getBranches(user, pagination);
  }
}
