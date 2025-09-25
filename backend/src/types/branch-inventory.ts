export interface IBranchInventory {
  id: string;
  organizationId: string;
  branchId: string;
  productId: string;
  quantityOnHand?: number;
  quantityReserved?: number;
  costPrice?: number;
  sellingPrice: number;
  isActive: boolean;
}
