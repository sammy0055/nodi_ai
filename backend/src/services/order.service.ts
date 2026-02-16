import { UserTypes } from '../data/data-types';
import { getUserRoleAndPermission } from '../helpers/get_user_role_and_perm';
import { scheduleReview } from '../helpers/rabbitmq/reviewQueue';
import { AreaModel } from '../models/area.model';
import { BranchesModel } from '../models/branches.model';
import { CustomerModel } from '../models/customer.model';
import { OrderModel } from '../models/order.module';
import { UserPermissionsModel } from '../models/permission.model';
import { ProductOptionChoiceModel } from '../models/product-option-choice.model';
import { ProductOptionModel } from '../models/product-option.model';
import { ProductModel } from '../models/products.model';
import { UserRoleModel } from '../models/role.model';
import { UsersModel } from '../models/users.model';
import { ZoneModel } from '../models/zones.model';
import { Pagination } from '../types/common-types';
import { IOrder, OrderStatusTypes } from '../types/order';
import { User } from '../types/users';
import { Op, literal, fn, col } from 'sequelize';

interface selectedOptionsAttributes {
  optionId: string;
  optionName: string;
  choiceId: string;
  choiceLabel: string;
  priceAdjustment: string;
}

interface OrderFilters {
  search: string;
  status: string;
}
export class OrderService {
  static async getOrders(
    user: Pick<User, 'id' | 'organizationId'>,
    { offset, limit, page }: Pagination,
    { search, status }: OrderFilters
  ) {
    const where: any = {
      organizationId: user.organizationId!,
    };

    const { userRole } = await getUserRoleAndPermission({ id: user.id, organizationId: user.organizationId! });
    if (userRole === UserTypes.Staff) {
      if (status) where.status = status;
      if (status !== OrderStatusTypes.PENDING) where.assignedUserId = user.id;
    } else {
      if (status) where.status = status;
    }
    if (search) {
      // escape quotes in keyword
      const escapedKeyword = search.replace(/'/g, "''");
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
          const productData = product?.get({ plain: true }) as any;
          if (product) {
            if (item?.selectedOptions?.length) {
              const selectedOptions = item.selectedOptions as selectedOptionsAttributes[];

              const options = [];
              for (const selected of selectedOptions) {
                if (!selected.optionId) continue;

                const option = await ProductOptionModel.findOne({
                  where: { id: selected.optionId, productId: product.id },
                  include: [
                    {
                      model: ProductOptionChoiceModel,
                      as: 'choices',
                      attributes: ['id', 'label', 'priceAdjustment'],
                      where: { id: selected.choiceId },
                    },
                  ],
                });

                if (option) {
                  const plain = option.get({ plain: true }) as any;
                  options.push({
                    ...plain,
                    choice: plain.choices?.[0] || null, // single object instead of array
                  });
                }
              }

              if (options.length) productData.options = options;
            }
          }
          // ✅ always attach product, even if no options
          plainOrder.items[i].product = productData;
          delete plainOrder.items[i].productId;
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
    if (status === 'delivered') await scheduleReview({ orderId: orderId });
  }

  static async updateOrder(order: IOrder, user: Pick<User, 'id' | 'organizationId'>) {
    if (order.organizationId !== user.organizationId) throw new Error('this order is not in your organization');
    const [_, updatedOrder] = await OrderModel.update(order, {
      where: { id: order.id, organizationId: order.organizationId },
      returning: true,
    });
    return updatedOrder[0].get({ plain: true }); // plain JS object
  }

  static async getAsignedOrders(user: Pick<User, 'id' | 'organizationId'>, { offset, limit, page }: Pagination) {
    const _user = (await UsersModel.findOne({
      where: { id: user.id, organizationId: user.organizationId },
      include: [
        {
          model: UserRoleModel,
          as: 'roles',
          include: [
            {
              model: UserPermissionsModel,
              as: 'permissions',
            },
          ],
        },
      ],
    })) as any;

    const currentUser = _user?.get({ plain: true }) as any;
    if (!currentUser) throw new Error('user does not exist');
    const userRlole = currentUser?.roles.length === 0 ? null : currentUser?.roles[0];
    if (!userRlole) throw new Error('user does not have permission to perform this action');
    const where =
      userRlole.name === UserTypes.Staff
        ? {
            organizationId: user.organizationId!,
            assignedUserId: user.id,
          }
        : {
            organizationId: user.organizationId!,
            assignedUserId: {
              [Op.and]: {
                [Op.not]: null,
              },
            },
          };

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
          const productData = product?.get({ plain: true }) as any;
          if (product) {
            if (item?.selectedOptions?.length) {
              const selectedOptions = item.selectedOptions as selectedOptionsAttributes[];

              const options = [];
              for (const selected of selectedOptions) {
                if (!selected.optionId) continue;

                const option = await ProductOptionModel.findOne({
                  where: { id: selected.optionId, productId: product.id },
                  include: [
                    {
                      model: ProductOptionChoiceModel,
                      as: 'choices',
                      attributes: ['id', 'label', 'priceAdjustment'],
                      where: { id: selected.choiceId },
                    },
                  ],
                });

                if (option) {
                  const plain = option.get({ plain: true }) as any;
                  options.push({
                    ...plain,
                    choice: plain.choices?.[0] || null, // single object instead of array
                  });
                }
              }

              if (options.length) productData.options = options;
            }
          }
          // ✅ always attach product, even if no options
          plainOrder.items[i].product = productData;
          delete plainOrder.items[i].productId;
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

  static async getOrderStats(user: Pick<User, 'id' | 'organizationId'>) {
    const stats = await OrderModel.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('totalAmount')), 'revenue']],
      group: ['status'],
      where: { organizationId: user.organizationId!, status: 'delivered' },
    });

    // format result
    let totalOrders = 0;
    let totalRevenue = 0;

    const statusCount: any = {
      processing: 0,
      delivered: 0,
      cancelled: 0,
      pending: 0,
    };

    stats.forEach((row: any) => {
      const count = Number(row.get('count'));
      const revenue = Number(row.get('revenue') || 0);

      totalOrders += count;
      totalRevenue += revenue;

      statusCount[row.status] = count;
    });

    const result = {
      totalOrders,
      totalRevenue,
      ...statusCount,
    };
    return result;
  }

  static async getOrdersAverageProcessingTime(user: Pick<User, 'id' | 'organizationId'>) {
    const data = await OrderModel.findAll({
      attributes: [
        'assignedUserId',
        'assignedUserName',
        [fn('AVG', col('estimatedCompletionTime')), 'averageEstimatedCompletionTime'],
      ],
      where: {
        status: 'delivered',
        assignedUserId: { [Op.ne]: null } as any,
        estimatedCompletionTime: { [Op.ne]: null } as any,
        organizationId: user.organizationId!,
      },
      group: ['assignedUserId', 'assignedUserName'],
      raw: true,
    });

    const result = data.map((row: any) => ({
      assignedUserId: row.assignedUserId,
      assignedUserName: row.assignedUserName,
      averageEstimatedCompletionTime: row.averageEstimatedCompletionTime
        ? Number(row.averageEstimatedCompletionTime)
        : 0,
    }));
    return result;
  }

  static async getOrderStatsPerAsignedUser(assignedUserId: string, user: Pick<User, 'organizationId'>) {
    const whereCondition = assignedUserId ? { assignedUserId } : { assignedUserId: { [Op.ne]: null } }; // NOT NULL

    const ALL_STATUSES = Object.values(OrderStatusTypes); // adjust to your real statuses

    const statusWhere: any = { organizationId: user.organizationId! };
    if (assignedUserId) statusWhere.assignedUserId = assignedUserId;
    if (assignedUserId) {
      statusWhere[Op.or] = [
        { status: OrderStatusTypes.PENDING }, // ignore assignedUserId
        {
          [Op.and]: [{ status: { [Op.ne]: OrderStatusTypes.PENDING } }, { assignedUserId }],
        },
      ];
    }
    const [rawStatusCounts, assignedCount, allOrdersCount] = await Promise.all([
      OrderModel.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        where: statusWhere,
        raw: true,
      }),
      OrderModel.count({
        where: { ...whereCondition, organizationId: user.organizationId! },
      }),
      OrderModel.count({
        where: { organizationId: user.organizationId! },
      }),
    ]);

    // Turn DB result into a map → { delivered: 3, pending: 1 }
    const countMap: Record<string, number> = {};
    for (const row of rawStatusCounts as any[]) {
      countMap[row.status] = Number(row.count);
    }

    // Ensure every status appears
    const statusCounts = ALL_STATUSES.map((status) => ({
      status,
      count: countMap[status] || 0,
    }));

    return {
      statusCounts,
      assignedToUser: assignedCount,
      allOrders: allOrdersCount,
    };
  }
}
