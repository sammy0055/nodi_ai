import { Op, literal } from 'sequelize';
import { User } from '../types/users';
import { Pagination } from '../types/common-types';
import { CustomerModel } from '../models/customer.model';
import { Conversation } from '../models/conversation.model';
import { ChatMessage } from '../models/chat-messages.model';

class CustomerService {
  static async getCustomers(
    user: Pick<User, 'id' | 'organizationId'>,
    { offset, limit, page }: Pagination,
    searchQuery: string
  ) {
    const where: any = {
      organizationId: user.organizationId!,
    };

    if (searchQuery && searchQuery.trim() !== '') {
      where[Op.and] = literal(`
        to_tsvector(
          'english',
          coalesce("Customers"."id"::text,'') || ' ' ||
          coalesce("Customers"."name",'') || ' ' ||
          coalesce("Customers"."phone",'')
        ) @@ plainto_tsquery('english', '${searchQuery}')
      `);
    }

    const { rows: customers, count: totalItems } = await CustomerModel.findAndCountAll({
      where,
      offset,
      limit,
      order: searchQuery
        ? [
            [
              literal(`
                ts_rank(
                  to_tsvector(
                    'english',
                    coalesce("Customers"."id"::text,'') || ' ' ||
                    coalesce("Customers"."name",'') || ' ' ||
                    coalesce("Customers"."phone",'')
                  ),
                  plainto_tsquery('english', '${searchQuery}')
                )
              `),
              'DESC',
            ],
            ['createdAt', 'DESC'],
          ]
        : [['createdAt', 'DESC']],
      include: [{ model: Conversation, as: 'conversations', include: [{ model: ChatMessage, as: 'messages' }] }],
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: customers,
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

export { CustomerService };
