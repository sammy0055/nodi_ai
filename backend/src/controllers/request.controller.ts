import { RequestService } from '../services/request.service';
import { RequestAttributes } from '../types/notification';
import { AdminUser, User } from '../types/users';

export class RequestController {
  static async createRequest(requestData: RequestAttributes, user: Pick<User, 'id' | 'organizationId'>) {
    return await RequestService.createRequest(requestData, user);
  }

  static async approveRequest(requestData: RequestAttributes, user: Pick<AdminUser, 'id' | 'email' | 'type'>) {
    return await RequestService.approveRequest(requestData, user);
  }
  static async getRequests(){
    return await RequestService.getRequest()
  }
}
