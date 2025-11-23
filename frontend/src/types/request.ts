export interface BaseRequestAttributes {
  id?: string;
  organizationId?: string;
  requesterUserId?: string;
  title: string;
  description: string;
  status?: 'pending' | 'approved' | 'rejected';
  requestType: 'CatalogRequest' | 'ProductRequest' | 'OrderRequest';
  approvedByUserId?: string | null;
  approvalNotes?: string | null;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  data?: {
    whatsappBusinessId: string;
    organizationId: string;
    organizationName: string;
  };
}

export interface IWhatsAppDetails {
  id?: string;
  whatsappBusinessId: string;
  organizationId: string;
  organizationName: string;
  catalogId: string;
}
