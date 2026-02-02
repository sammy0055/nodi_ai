import { Op } from 'sequelize';
import { ProductOptionModel } from '../models/product-option.model';
import { ProductOption } from '../types/product-option';
import { User } from '../types/users';

export class ProductOptionService {
  static async create(
    data: Omit<ProductOption, 'id'>,
    user: Pick<User, 'id' | 'organizationId'>
  ): Promise<ProductOptionModel> {
    if (!user?.organizationId) throw new Error('kindly create an organization to continue');
    return await ProductOptionModel.create(data);
  }

  static async updateOptions(data: any | any[]) {
    const items = Array.isArray(data) ? data : [data];

    const updated = await Promise.all(
      items.map(async (item) => {
        const choice = await ProductOptionModel.findByPk(item.id);
        if (!choice) throw new Error(`Product option with id ${item.id} not found`);
        return await choice.update(item); // already returns updated row
      })
    );

    // If input was array → return array, else return single object
    return Array.isArray(data) ? updated : updated[0];
  }

  static async update(data: Partial<ProductOption>): Promise<ProductOptionModel | null> {
    // const option = await ProductOptionModel.findByPk(data.id);
    // if (!option) throw new Error('Product option not found');

    // return await option.update(data, { returning: true });
    return (await this.updateOptions(data)) as any;
  }

  static async remove(id: string): Promise<boolean> {
    const deleted = await ProductOptionModel.destroy({
      where: { id },
    });
    return deleted > 0;
  }

  static async getOne(id: string): Promise<ProductOptionModel | null> {
    return await ProductOptionModel.findByPk(id, {
      include: [
        {
          association: 'productOptionChoice',
        },
      ],
    });
  }

  static async getMany(filters?: {
    productIds?: string[];
    isRequired?: boolean;
    type?: ProductOption['type'];
  }): Promise<ProductOptionModel[]> {
    const where: any = {};

    if (filters?.productIds?.length) {
      where.productId = {
        [Op.in]: filters.productIds,
      };
    }

    if (filters?.isRequired !== undefined) {
      where.isRequired = filters.isRequired;
    }
    if (filters?.type) {
      where.type = filters.type;
    }

    return await ProductOptionModel.findAll({
      where,
      include: [
        {
          association: 'choices',
        },
      ],
    });
  }
}
