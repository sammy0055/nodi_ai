import { literal, Op } from 'sequelize';
import { BranchesModel } from '../models/branches.model';
import { CustomerModel } from '../models/customer.model';
import { OrderModel } from '../models/order.module';
import { ReviewModel } from '../models/review.model';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';

export class ReviewService {
  static async getReviewsByOrganization(
    user: Pick<User, 'id' | 'organizationId'>,
    { offset = 0, limit = 10, page = 1 }: Pagination,
    searchQuery: string
  ) {
    if (!user.organizationId) throw new Error('kindly create an organization to continue');
    const where: any = {
      organizationId: user.organizationId,
    };

    if (searchQuery && searchQuery.trim() !== '') {
      const safeQuery = searchQuery.trim(); // prevent SQL injection

      where[Op.and] = literal(`
        to_tsvector(
          'english',
          coalesce("Reviews"."comment",'') || ' ' ||
          coalesce("Reviews"."customerId",'') || ' ' ||
          coalesce("Reviews"."orderId",'')
        )
        @@ plainto_tsquery('english', ${safeQuery})
      `);
    }

    const { rows: reviews, count: totalItems } = await ReviewModel.findAndCountAll({
      where,
      include: [
        { model: CustomerModel, as: 'customer', attributes: ['id', 'name'] },
        {
          model: OrderModel,
          as: 'order',
          attributes: ['id', 'totalAmount', 'serviceType', 'items', 'currency', 'createdAt'],
          include: [{ model: BranchesModel, as: 'branch', attributes: ['id', 'name'] }],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      reviews,
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
