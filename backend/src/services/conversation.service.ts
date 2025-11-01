import { ChatMessage } from '../models/chat-messages.model';
import { Conversation } from '../models/conversation.model';
import { Pagination } from '../types/common-types';

export class ConversationService {
  static async getConversationsbyOrgId(organizationId: string, { offset, limit, page }: Pagination) {
    if (!organizationId) throw Error('admin: organization id is required for this action');
    const { rows: convs, count: totalItemsRaw } = await Conversation.findAndCountAll({
      where: { organizationId: organizationId },
      offset,
      limit,
      include: [{ model: ChatMessage, as: 'messages' }],
    });
    // totalItems from Sequelize can be number or object depending on dialect; ensure numeric
    const totalItems = typeof totalItemsRaw === 'number' ? totalItemsRaw : (totalItemsRaw as any).count || 0;

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
    return {
      data: convs,
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
