import { NotificationPriority, NotificationStatus, RelatedEntityType, RequestStatus } from '../data/data-types';

export interface NotificationAttributes {
  id: string;
  organizationId: string | null; // The tenant organization sending the request
  senderUserId: string | null; // User from tenant organization who sent the request
  recipientType: 'tenant' | 'admin';
  title: string;
  message: string;
  status: `${NotificationStatus}`;
  relatedEntityType: `${RelatedEntityType}`;
  priority: NotificationPriority;
  readAt: Date | null;
}

export interface BaseRequestAttributes {
  id: string;
  organizationId: string;
  requesterUserId: string;
  title: string;
  description: string;
  status:  `${RequestStatus}`;
  requestType: `${RelatedEntityType}`;
  approvedByUserId: string | null;
  approvalNotes: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CatalogRequestData {
  whatsappBusinessId: string;
}

export interface CatalogRequestAttributes extends BaseRequestAttributes {
  requestType: RelatedEntityType.CatalogRequest;
  data: CatalogRequestData;
}

export interface GenericRequestAttributes extends BaseRequestAttributes {
  requestType: Exclude<RelatedEntityType, 'CatalogRequest'>;
  data: Record<string, any>;
}

export type RequestAttributes = CatalogRequestAttributes | GenericRequestAttributes;


