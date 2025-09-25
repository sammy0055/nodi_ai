export interface BaseRequestAttributes {
  id: string;
  organizationId: string;
  requesterUserId: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  requestType: 'CatalogRequest' | 'ProductRequest' | 'OrderRequest';
  approvedByUserId: string | null;
  approvalNotes: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  data: Record<string, any>;
}
