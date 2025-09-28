export interface IBranch {
  id: string;
  organizationId?: string;
  name: string;
  code?: string;
  phone: string;
  email: string;
  isActive?: boolean;
  location: string;
  supportsDelivery: boolean;
  supportsTakeAway: boolean;
  deliveryTime?: Date;
  takeAwayTime?: Date;
}

export interface IBranchInventory {
  id?: string;
  organizationId?: string;
  branchId: string;
  productId: string;
  quantityOnHand?: number;
  quantityReserved?: number;
  costPrice?: number;
  sellingPrice: number;
  isActive: boolean;
}

export interface IZone {
  id?: string;
  organizationId?: string;
  name: string;
}

export interface IArea {
  id?: string;
  organizationId?: string;
  name: string;
  branchId: string;
  zoneId: string;
  deliveryTime: Date;
  deliveryCharge: number;
}
