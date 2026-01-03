import { CustomerModel } from '../models/customer.model';
import { OrderModel } from '../models/order.module';
import { ReviewModel } from '../models/review.model';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';

interface GetReviewParams {
  searchQuery?: string;
  rating?: number;
}
export class ReviewService {
  static async getReviewsByOrganization(
    user: Pick<User, 'id' | 'organizationId'>,
    { offset = 0, limit = 10, page = 1 }: Pagination,
    { searchQuery, rating }: GetReviewParams
  ) {
    if (!user.organizationId) throw new Error('kindly create an organization to continue');
    const where: any = {
      organizationId: user.organizationId,
    };
    if (rating) where.rating = rating;
    if (searchQuery && searchQuery.trim() !== '') {
      const safeQuery = searchQuery.trim(); // prevent SQL injection
    }

    const { rows: reviews, count: totalItems } = await ReviewModel.findAndCountAll({
      where,
      include: [
        { model: CustomerModel, as: 'customer', attributes: ['id', 'name'] },
        {
          model: OrderModel,
          as: 'order',
          attributes: ['id', 'totalAmount', 'currency', 'createdAt'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: reviews,
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
