import { ProductService } from '../services/product.service';
import { Pagination } from '../types/common-types';
import { File } from '../types/file';
import { IProduct } from '../types/product';
import { User } from '../types/users';

export class ProductController {
  static async createProduct(product: IProduct, user: Pick<User, 'id' | 'organizationId'>, file:File) {
    return await ProductService.createProduct(product, user, file);
  }
  static async updateProduct(product: IProduct, user: Pick<User, 'id' | 'organizationId'>, file:File) {
    return await ProductService.updateProduct(product, user, file);
  }
  static async removeProduct(productId: string, user: Pick<User, 'id' | 'organizationId'>) {
    await ProductService.removeProduct(productId, user);
  }
  static async getProduct(productId: string, user: Pick<User, 'id' | 'organizationId'>) {
    return await ProductService.getProduct(productId, user);
  }
  static async getProducts(user: Pick<User, 'id' | 'organizationId'>, pagination: Pagination, searchQuery: string) {
    return await ProductService.getProducts(user, pagination, searchQuery);
  }
}
