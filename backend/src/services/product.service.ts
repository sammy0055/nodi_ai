import { ImageUploadHelper } from '../helpers/image-upload';
import { WhatsappCatalogHelper } from '../helpers/whatsapp-catalog';
import { validateFile } from '../middleware/validation/file';
import { ProductModel } from '../models/products.model';
import { WhatSappSettingsModel } from '../models/whatsapp-settings.model';
import { Pagination } from '../types/common-types';
import { File } from '../types/file';
import { IProduct } from '../types/product';
import { User } from '../types/users';
import { Op, literal } from 'sequelize';

export class ProductService {
  static async createProduct(product: IProduct, user: Pick<User, 'id' | 'organizationId'>, file: File) {
    if (!user.organizationId) throw new Error('kindly create an organization to continue');
    // const whatsappData = await WhatSappSettingsModel.findOne({ where: { organizationId: user.organizationId } });
    // if (!whatsappData?.catalogId) throw new Error("you don't have an active catalog, kindly create one");
    const { valid, errors } = validateFile(file);
    if (!valid) throw new Error(errors.join(', '));
    const manageImageFile = new ImageUploadHelper();
    const createdProduct = await ProductModel.create({
      ...product,
      organizationId: user.organizationId,
      metaProductId: 'ddedde',
    });

    const { imgUrl, path } = await manageImageFile.uploadImage(file);
    // const whatsappCatalogItem = await WhatsappCatalogHelper.createMetaCatalogItem(
    //   {
    //     itemId: createdProduct.id,
    //     name: createdProduct.name,
    //     description: createdProduct.description,
    //     price: createdProduct.price,
    //     imageUrl: imgUrl,
    //   },
    //   whatsappData
    // );
 
    const [_, updatedRows] = await ProductModel.update(
      { imageUrl: imgUrl, filePath: path },
      { where: { id: createdProduct.id }, returning: true }
    );
    const updatedProduct = updatedRows[0].get({ plain: true }); // plain JS object
    return updatedProduct;
  }

  static async updateProduct(product: IProduct, user: Pick<User, 'id' | 'organizationId'>, file: File) {
    const { id, ...productWithOutId } = product;
    if (!id) throw new Error('product id is required');
    if (!user.organizationId) throw new Error('kindly create an organization to continue');
    // const whatsappData = await WhatSappSettingsModel.findOne({ where: { organizationId: user.organizationId } });
    // if (!whatsappData?.catalogId) throw new Error("you don't have an active catalog, kindly create one");
    const manageImageFile = new ImageUploadHelper();
    const oldProduct = await ProductModel.findByPk(id);
    if (!oldProduct) throw new Error('product does not exist');
    if (file) {
      const { path, imgUrl } = await manageImageFile.replaceImageFile(oldProduct.filePath, file);

      const [_, updatedRows] = await ProductModel.update(
        { ...productWithOutId, filePath: path, imageUrl: imgUrl },
        { where: { id: id }, returning: true }
      );
      const updatedProduct = updatedRows[0].get({ plain: true }); // plain JS object
      return updatedProduct;
    }
    const [_, updatedRows] = await ProductModel.update(productWithOutId, { where: { id: id }, returning: true });
    const updatedProduct = updatedRows[0].get({ plain: true }); // plain JS object
    return updatedProduct;
  }

  static async removeProduct(productId: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!productId) throw new Error('product id is required');
    // const whatsappData = await WhatSappSettingsModel.findOne({ where: { organizationId: user.organizationId } });
    // if (!whatsappData?.catalogId) throw new Error("you don't have an active catalog, kindly create one");
    const oldProduct = await ProductModel.findByPk(productId);
    if (!oldProduct) throw new Error('product not found');
    const manageImageFile = new ImageUploadHelper();
    await manageImageFile.deleteImageFile([oldProduct.filePath]);
    return await ProductModel.destroy({ where: { id: productId } });
  }

  static async getProduct(productId: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!productId) throw new Error('product id is required');
    if (!user.organizationId) throw new Error('kindly create an organization to continue');
    return await ProductModel.findByPk(productId);
  }

  static async getProducts(
    user: Pick<User, 'id' | 'organizationId'>,
    { offset, limit, page }: Pagination,
    searchQuery: string
  ) {
    const where: any = {
      organizationId: user.organizationId!,
    };
    if (searchQuery && searchQuery.trim() !== '') {
      where[Op.and] = literal(`
    to_tsvector('english', coalesce("Products"."name",'') || ' ' || coalesce("Products"."description",''))
    @@ plainto_tsquery('english', '${searchQuery}')
  `);
    }
    const { rows: products, count: totalItems } = await ProductModel.findAndCountAll({
      where,
      offset,
      limit,
      order: searchQuery
        ? [
            // rank by relevance if searching
            [
              literal(`
            ts_rank(
              to_tsvector('english', coalesce("Products"."name",'') || ' ' || coalesce("Products"."description",'')),
              plainto_tsquery('english', '${searchQuery}')
            )
          `),
              'DESC',
            ],
            ['createdAt', 'DESC'],
          ]
        : [['createdAt', 'DESC']], // ✅ fallback
    });

    // prepare pagination info
    const totalPages = Math.ceil(totalItems / limit);
    return {
      data: products,
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
