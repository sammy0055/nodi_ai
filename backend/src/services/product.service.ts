import { ImageUploadHelper } from '../helpers/image-upload';
import { syncMetaCatalogToDB } from '../helpers/sync_whatsapp_catalop_with_db';
import { WhatsappCatalogHelper } from '../helpers/whatsapp-catalog';
import { validateFile } from '../middleware/validation/file';
import { sequelize } from '../models/db';
import { ProductModel } from '../models/products.model';
import { WhatSappSettingsModel } from '../models/whatsapp-settings.model';
import { Pagination } from '../types/common-types';
import { File } from '../types/file';
import { IProduct } from '../types/product';
import { User } from '../types/users';
import { Op, literal, Transaction } from 'sequelize';

export class ProductService {
  static async createProduct(
  product: IProduct,
  user: Pick<User, 'id' | 'organizationId'>,
  file: File
) {
  const transaction: Transaction = await sequelize.transaction();

  try {
    if (!user.organizationId) throw new Error('kindly create an organization to continue');

    const whatsappData = await WhatSappSettingsModel.findOne({
      where: { organizationId: user.organizationId },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!whatsappData?.catalogId)
      throw new Error("you don't have an active catalog, kindly create one");

    const { valid, errors } = validateFile(file);
    if (!valid) throw new Error(errors.join(', '));

    const manageImageFile = new ImageUploadHelper();
    const { id, ...restData } = product;

    // ✅ CREATE PRODUCT (inside transaction)
    const createdProduct = await ProductModel.create(
      {
        ...restData,
        organizationId: user.organizationId,
        metaProductId: 'pending', // temporary
      },
      { transaction }
    );

    // 🔹 Upload image (external — not part of DB transaction)
    const { imgUrl, path } = await manageImageFile.uploadImageTos3(file, {
      orgainationId: user.organizationId,
      productId: createdProduct.id,
    });

    // 🔹 Create Meta/WhatsApp catalog item (external)
    await WhatsappCatalogHelper.createMetaCatalogItem(
      {
        itemId: createdProduct.id,
        name: createdProduct.name,
        description: createdProduct.description,
        price: createdProduct.price,
        currency: product.currency!,
        imageUrl: imgUrl,
      },
      whatsappData
    );

    // ✅ UPDATE PRODUCT (still inside transaction)
    const [_, updatedRows] = await ProductModel.update(
      {
        imageUrl: imgUrl,
        filePath: path,
        metaProductId: createdProduct.id,
      },
      {
        where: { id: createdProduct.id },
        returning: true,
        transaction,
      }
    );

    await transaction.commit();

    return updatedRows[0].get({ plain: true });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

static async updateProduct(
  product: IProduct,
  user: Pick<User, 'id' | 'organizationId'>,
  file?: File
) {
  const transaction: Transaction = await sequelize.transaction();
  const manageImageFile = new ImageUploadHelper();

  let newImagePath: string | undefined;
  let newImageUrl: string | undefined;

  try {
    const { id, ...productWithOutId } = product;

    if (!id) throw new Error('product id is required');
    if (!user.organizationId) throw new Error('kindly create an organization to continue');

    const whatsappData = await WhatSappSettingsModel.findOne({
      where: { organizationId: user.organizationId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!whatsappData?.catalogId)
      throw new Error("you don't have an active catalog, kindly create one");

    const oldProduct = await ProductModel.findOne({
      where: { id, organizationId: user.organizationId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!oldProduct) throw new Error('product does not exist');

    // 🔹 If image is being replaced (external)
    if (file) {
      const uploadResult = await manageImageFile.updateS3ImageFile(oldProduct.filePath, file);
      newImagePath = uploadResult.path;
      newImageUrl = uploadResult.imgUrl;

      productWithOutId.filePath = newImagePath;
      productWithOutId.imageUrl = newImageUrl;
    }

    // ✅ Update DB (inside transaction)
    const [_, updatedRows] = await ProductModel.update(productWithOutId, {
      where: { id },
      returning: true,
      transaction,
    });

    const updatedProduct = updatedRows[0].get({ plain: true });

    // 🔹 Update Meta catalog (external)
    await WhatsappCatalogHelper.updateMetaCatalogItem(
      {
        itemId: id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        currency: updatedProduct.currency!,
        imageUrl: newImageUrl ?? updatedProduct.imageUrl,
      },
      whatsappData
    );

    await transaction.commit();
    return updatedProduct;

  } catch (error) {
    await transaction.rollback();

    // 🧹 Cleanup newly uploaded image if DB failed
    if (newImagePath) {
      await manageImageFile.deleteS3ImageFile(newImagePath).catch(() => {});
    }

    throw error;
  }
}

  static async removeProduct(productId: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!productId) throw new Error('product id is required');
    const whatsappData = await WhatSappSettingsModel.findOne({ where: { organizationId: user.organizationId } });
    if (!whatsappData?.catalogId) throw new Error("you don't have an active catalog, kindly create one");
    const oldProduct = await ProductModel.findByPk(productId);
    if (!oldProduct) throw new Error('product not found');
    const manageImageFile = new ImageUploadHelper();
    await manageImageFile.deleteS3ImageFile(oldProduct.filePath);
    const data = await ProductModel.destroy({ where: { id: productId } });
    await WhatsappCatalogHelper.deleteMetaCatalogItem({ itemId: oldProduct.metaProductId }, whatsappData);
    return data;
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

  static async syncWhatsappCatalogToDB(user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.organizationId) throw new Error('organization does not exit');
    const whatsappsettings = await WhatSappSettingsModel.findOne({ where: { organizationId: user.organizationId } });
    if (!whatsappsettings?.catalogId) throw new Error('whatsapp catalog does not exist for this organization');
    await syncMetaCatalogToDB({ catalogId: whatsappsettings.catalogId, organizationId: user.organizationId });
  }
}
