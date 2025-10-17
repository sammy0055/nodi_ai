import { AreaModel } from '../models/area.model';
import { BranchesModel } from '../models/branches.model';
import { CustomerModel } from '../models/customer.model';
import { OrderModel } from '../models/order.module';
import { ProductModel } from '../models/products.model';
import { ZoneModel } from '../models/zones.model';
import { Pagination } from '../types/common-types';
import { OrderStatusTypes } from '../types/order';
import { User } from '../types/users';
import { Op, literal } from 'sequelize';

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

    // prepare pagination info
    const totalPages = Math.ceil(totalItems / limit);
    const plainOrders = [];

    for (const order of orders) {
      const plainOrder = order.get({ plain: true });

      for (let i = 0; i < plainOrder.items.length; i++) {
        const item = plainOrder.items[i];

        if (item.productId) {
          const product = await ProductModel.findByPk(item.productId);
          if (product) {
            plainOrder.items[i].product = product.get({ plain: true });
            delete plainOrder.items[i].productId;
          }
        }

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
        }
        plainOrders.push(plainOrder);
      }

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
