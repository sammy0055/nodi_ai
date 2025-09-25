export interface IBranch {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  phone: string;
  email: string;
  isActive?: boolean;
  location: string;
  supportsDelivery:boolean
  supportsTakeAway:boolean
  deliveryTime: Date;
  takeAwayTime: Date;
}
