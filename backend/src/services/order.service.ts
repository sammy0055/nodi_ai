import { AreaModel } from '../models/area.model';
import { BranchesModel } from '../models/branches.model';
import { CustomerModel } from '../models/customer.model';
import { OrderModel } from '../models/order.module';
import { ProductOptionChoiceModel } from '../models/product-option-choice.model';
import { ProductOptionModel } from '../models/product-option.model';
import { ProductModel } from '../models/products.model';
import { ZoneModel } from '../models/zones.model';
import { Pagination } from '../types/common-types';
import { OrderStatusTypes } from '../types/order';
import { User } from '../types/users';
import { JSON, Op, literal } from 'sequelize';

interface selectedOptionsAttributes {
  optionId: string;
  optionName: string;
  choiceId: string;
  choiceLabel: string;
  priceAdjustment: string;
}

export class OrderService {
  static async getOrders(
    user: Pick<User, 'id' | 'organizationId'>,
    { offset, limit, page }: Pagination,
    searchQuery: string
  ) {
    const where: any = {
      organizationId: user.organizationId!,
    };
    if (searchQuery) {
      // escape quotes in keyword
      const escapedKeyword = searchQuery.replace(/'/g, "''");
      where[Op.and] = literal(`searchVector @@ plainto_tsquery('english', '${escapedKeyword}')`);
    }
    const { rows: orders, count: totalItems } = await OrderModel.findAndCountAll({
      where,
      offset,
      limit,
      include: [
        { model: CustomerModel, as: 'customer' },
        { model: BranchesModel, as: 'branch' },
      ], // join for customer info
      order: [['createdAt', 'DESC']], // recent first
    });

    const totalPages = Math.ceil(totalItems / limit);
    const plainOrders = [];

    for (const order of orders) {
      const plainOrder = order.get({ plain: true });

      // loop through order items
      for (let i = 0; i < plainOrder.items.length; i++) {
        const item = plainOrder.items[i];

        if (item.productId) {
          const product = await ProductModel.findByPk(item.productId);
          if (product) {
            if (item?.selectedOptions?.length !== 0) {
              const selectedOptions = item.selectedOptions as selectedOptionsAttributes[];
              const optionIds = selectedOptions.map((op) => op.optionId);
              const options = await ProductOptionModel.findAll({
                where: { id: { [Op.in]: optionIds.filter(Boolean) }, productId: product.id },
                include: [
                  {
                    model: ProductOptionChoiceModel,
                    as: 'choices',
                    attributes: ['id', 'label', 'priceAdjustment'],
                    where: { id: item.selectedOptions?.choiceId },
                  },
                ],
              });

              // convert choices array to single object
              const plainOptions = options.map((opt) => {
                const plain = opt.get({ plain: true }) as any;
                return {
                  ...plain,
                  choice: plain.choices?.[0], // remove the array if you don’t need it
                };
              });

              const productData = product.get({ plain: true }) as any;
              if (options.length) productData.options = plainOptions;

              plainOrder.items[i].product = productData;
              delete plainOrder.items[i].productId;
            }
          }
        }
      }

      // attach area if present
      if (plainOrder.deliveryAreaId) {
        const area = await AreaModel.findByPk(plainOrder.deliveryAreaId, {
          include: [{ model: ZoneModel, as: 'zone', attributes: ['id', 'name'] }],
        });

        if (area) {
          const plainArea = area.get({ plain: true }) as any;
          plainOrder.area = {
            id: plainArea.id,
            name: plainArea.name,
            zone: plainArea.zone,
          };
        }
      } else {
        plainOrder.area = null;
      }

      // push after processing
      plainOrders.push(plainOrder);
    }
    console.log('====================================');
    console.log(plainOrders);
    console.log('====================================');
    // ✅ Return only after all orders are processed
    return {
      data: plainOrders,
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
  static async updateOrderStatus(
    user: Pick<User, 'id' | 'organizationId'>,
    orderId: string,
    status: `${OrderStatusTypes}`
  ) {
    if (!user.organizationId) throw new Error('no organization exist for this order');
    await OrderModel.update({ status: status }, { where: { id: orderId, organizationId: user.organizationId } });
  }
}
