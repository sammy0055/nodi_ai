import { ZoneModel } from '../models/zones.model';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';
import { Op, literal } from 'sequelize';

export class ZoneService {
  static async createZone(name: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!name) throw new Error('zone name is required');
    if (!user.organizationId) throw new Error('organization does not exist');
    const zone = await ZoneModel.create({ name: name, organizationId: user.organizationId } as any);
    return zone;
  }
  static async updateZone(name: string, zoneId: string) {
    if (!name) throw new Error('zone name is required');
    const [_, updatedRows] = await ZoneModel.update({ name }, { where: { id: zoneId }, returning: true });
    const updatedProduct = updatedRows[0].get({ plain: true }); // plain JS object
    return updatedProduct;
  }
  static async removeZone(zoneId: string) {
    await ZoneModel.destroy({ where: { id: zoneId } });
  }
  static async getZone(zoneId: string) {
    if (!zoneId) throw new Error('zoneId is required');
    return await ZoneModel.findByPk(zoneId);
  }
  static async getZones(
    user: Pick<User, 'id' | 'organizationId'>,
    { offset, limit, page }: Pagination,
    searchQuery?: string
  ) {
    const where: any = { organizationId: user.organizationId! };

    // add full-text search condition if searchQuery exists
    if (searchQuery) {
      where[Op.and] = literal(`to_tsvector('english', "name") @@ plainto_tsquery('english', '${searchQuery}')`);
    }

    const { rows: zones, count: totalItems } = await ZoneModel.findAndCountAll({
      where,
      // distinct: true, // <-- important to avoid duplicate-count from joins
      // col: 'id', // optional: ensures count works on primary key
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    // prepare pagination info
    const totalPages = Math.ceil(totalItems / limit);
    return {
      data: zones,
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
