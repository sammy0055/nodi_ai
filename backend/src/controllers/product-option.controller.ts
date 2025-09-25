import { ProductOptionService } from '../services/product-option.service';
import { ProductOption } from '../types/product-option';
import { User } from '../types/users';

export class ProductOptionController {
  static async create(data: Omit<ProductOption, 'id'>, user: Pick<User, 'id' | 'organizationId'>) {
    return await ProductOptionService.create(data, user);
  }
  static async update(data: Partial<ProductOption>) {
    return await ProductOptionService.update(data);
  }
  static async remove(id: string) {
    return await ProductOptionService.remove(id);
  }
  static async getOne(id: string) {
    return await ProductOptionService.getOne(id);
  }
  static async getMany() {
    return await ProductOptionService.getMany();
  }
}
