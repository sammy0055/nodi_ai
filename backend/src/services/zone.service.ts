import { ZoneModel } from '../models/zones.model';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';

export class ZoneService {
  static async createZone(name: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!name) throw new Error('zone name is required');
    if (!user.organizationId) throw new Error('organization does not exist');
    const zone = await ZoneModel.create({ name: name, organizationId: user.organizationId } as any);
    return zone;
  }
  static async updateZone(name: string, zoneId: string) {
    if (!name) throw new Error('zone name is required');
    const zone = await ZoneModel.update({ name }, { where: { id: zoneId }, returning: true });
    return zone;
  }
  static async removeZone(zoneId: string) {
    await ZoneModel.destroy({ where: { id: zoneId } });
  }
  static async getZone(zoneId: string) {
    if (!zoneId) throw new Error('zoneId is required');
    return await ZoneModel.findByPk(zoneId);
  }
  static async getZones(user: Pick<User, 'id' | 'organizationId'>, { offset, limit, page }: Pagination) {
    const { rows: products, count: totalItems } = await ZoneModel.findAndCountAll({
      where: { organizationId: user.organizationId! },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    // prepare pagination info
    const totalPages = Math.ceil(totalItems / limit);
    return {
      data: products,
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
