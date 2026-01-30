import { Op, literal } from 'sequelize';
import { User } from '../types/users';
import { Pagination } from '../types/common-types';
import { CustomerModel } from '../models/customer.model';
import { Conversation } from '../models/conversation.model';
import { ChatMessage } from '../models/chat-messages.model';
import { ICustomer } from '../types/customers';

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
      // distinct: true, // ✅ important
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

  static async changeCustomerStatus(customer: Pick<ICustomer, 'status' | 'id'>, user: Pick<User, 'organizationId'>) {
    const [_, updatedRows] = await CustomerModel.update(
      { status: customer.status },
      { where: { organizationId: user.organizationId!, id: customer.id }, returning: true }
    );

    const updatedCustomer = updatedRows[0].get({ plain: true }); // plain JS object
    return updatedCustomer;
  }
}

export { CustomerService };
