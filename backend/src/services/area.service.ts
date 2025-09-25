import { AreaModel } from '../models/area.model';
import { IArea } from '../types/area';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';

export class AreaService {
  static async createArea(area: IArea, user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.organizationId) throw new Error('organization id is required');
    return await AreaModel.create(area);
  }
  static async updateArea(area: IArea, user: Pick<User, 'id' | 'organizationId'>) {
    const { id, ...areaWithOutId } = area;
    if (!id) throw new Error('area id is required');
    if (!user.organizationId) throw new Error("you don't have an organization");
    return await AreaModel.update(areaWithOutId, { where: { id: id }, returning: true });
  }
  static async removeArea(areaId: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!areaId) throw new Error('area id is required');
    if (!user.organizationId) throw new Error("you don't have an organization");
    await AreaModel.destroy({ where: { id: areaId } });
  }
  static async getArea(areaId: string, user: Pick<User, 'id' | 'organizationId'>) {
    return await AreaModel.findByPk(areaId);
  }
  static async getAreas(
    user: Pick<User, 'id' | 'organizationId'>,
    { offset, limit, page }: Pagination
  ) {
    const { rows: areas, count: totalItems } = await AreaModel.findAndCountAll({
      where: { organizationId: user.organizationId! },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    // prepare pagination info
    const totalPages = Math.ceil(totalItems / limit);
    return {
      data: areas,
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
