import { literal, Op } from 'sequelize';
import { BranchesModel } from '../models/branches.model';
import { CustomerModel } from '../models/customer.model';
import { OrderModel } from '../models/order.module';
import { ReviewModel } from '../models/review.model';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';
import { ProductModel } from '../models/products.model';

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

      where[Op.and] = literal(`
        to_tsvector(
          'english',
          coalesce("Reviews"."comment",'') || ' '
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

    // ---- populate product details in each order.items ----
    const allProductIds = new Set<string>();
    for (const review of reviews as any) {
      const order = review.order;
      if (order?.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item.productId) allProductIds.add(item.productId);
        }
      }
    }

    if (allProductIds.size > 0) {
      const products = await ProductModel.findAll({
        where: { id: { [Op.in]: Array.from(allProductIds) } },
        attributes: ['id', 'name', 'imageUrl'],
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // merge product details into items
      for (const review of reviews as any) {
        const order = review.order;
        if (order?.items && Array.isArray(order.items)) {
          order.items = order.items.map((item: any) => ({
            ...item,
            product: productMap.get(item.productId) || null,
          }));
        }
      }
    }

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
