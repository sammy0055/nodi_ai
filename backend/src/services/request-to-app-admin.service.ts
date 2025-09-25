import { User } from '../types/users';

export class RequestToAppAdminService {
  static async requestCatalogCreation(input: CreateCatalogRequestInput, user: User) {
    // Here you would typically send an email or notification to the app admin
  }
}

interface CreateCatalogRequestInput {
  whatsappBusinessId: string;
}
