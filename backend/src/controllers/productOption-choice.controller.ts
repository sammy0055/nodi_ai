import { ProductOptionChoiceService } from '../services/productOptionChoice.service';
import { ProductOptionChoice } from '../types/product-option';
import { User } from '../types/users';

export class ProductOptionChoiceController {
  static async create(data: Omit<ProductOptionChoice, 'id'>, user: Pick<User, 'id' | 'organizationId'>) {
    return await ProductOptionChoiceService.create(data, user);
  }
  static async update(data: Partial<ProductOptionChoice>) {
    return await ProductOptionChoiceService.update(data);
  }
  static async remove(id: string) {
    return await ProductOptionChoiceService.remove(id);
  }
  static async getOne(id: string) {
    return await ProductOptionChoiceService.getOne(id);
  }
  static async getMany(filters?: { productOptionId?: string; isDefault?: boolean }) {
    return await ProductOptionChoiceService.getMany(filters);
  }
}
