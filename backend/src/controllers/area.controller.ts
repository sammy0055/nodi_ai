import { AreaService } from '../services/area.service';
import { IArea } from '../types/area';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';

export class AreaController {
  static async createArea(area: IArea, user: Pick<User, 'id' | 'organizationId'>) {
    return await AreaService.createArea(area, user)
  }
  static async updateArea(area: IArea, user: Pick<User, 'id' | 'organizationId'>) {
    return await AreaService.updateArea(area, user)
  }
  static async removeArea(areaId: string, user: Pick<User, 'id' | 'organizationId'>) {
    await AreaService.removeArea(areaId, user)
  }
  static async getArea(areaId: string, user: Pick<User, 'id' | 'organizationId'>) {
    return await AreaService.getArea(areaId, user)
  }
  static async getAreas(user: Pick<User, 'id' | 'organizationId'>, pagination:Pagination) {
    return await AreaService.getAreas(user, pagination)
  }
}
