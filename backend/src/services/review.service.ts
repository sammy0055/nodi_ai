import { CustomerModel } from '../models/customer.model';
import { OrderModel } from '../models/order.module';
import { ReviewModel } from '../models/review.model';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';
import { fn, col, literal } from 'sequelize';

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

  static async getReviewStats(user: Pick<User, 'id' | 'organizationId'>) {
    const stats = (await ReviewModel.findOne({
      attributes: [
        // total reviews WITH rating
        [fn('COUNT', col('rating')), 'total'],

        // average (NULL-safe)
        [fn('AVG', col('rating')), 'average'],

        // positive (4–5 only, ignore NULL)
        [fn('SUM', literal(`CASE WHEN rating >= 4 THEN 1 ELSE 0 END`)), 'positive'],

        // negative (1–2 only, ignore NULL)
        [fn('SUM', literal(`CASE WHEN rating <= 2 THEN 1 ELSE 0 END`)), 'negative'],
      ],
      where: { organizationId: user.organizationId },
      raw: true,
    })) as any;

    const result = {
      total: Number(stats?.total || 0), // NULL ratings excluded
      averageRating: stats.average ? Number(stats.average || 0).toFixed(1) : '0.0',
      positive: Number(stats.positive || 0),
      negative: Number(stats.negative || 0),
    };

    return result;
  }
}
