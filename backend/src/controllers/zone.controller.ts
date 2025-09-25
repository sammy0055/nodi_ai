import { ZoneService } from '../services/zone.service';
import { Pagination } from '../types/common-types';
import { User } from '../types/users';

export class ZoneController {
  static async createZone(name: string, user: Pick<User, 'id' | 'organizationId'>) {
    return await ZoneService.createZone(name, user);
  }
  static async updateZone(name: string, zoneId: string) {
    return await ZoneService.updateZone(name, zoneId);
  }
  static async removeZone(zoneId: string) {
    return await ZoneService.removeZone(zoneId);
  }
  static async getZone(zoneId: string) {
    return await ZoneService.getZone(zoneId);
  }
  static async getZones(user: Pick<User, 'id' | 'organizationId'>, pagination:Pagination) {
    return await ZoneService.getZones(user, pagination);
  }
}
