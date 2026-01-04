export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  processing: number;
  delivered: number;
  cancelled: number;
  pending: number;
}

export interface OrderAverageProcessingTimpe {
  assignedUserId: string;
  assignedUserName: string;
  averageEstimatedCompletionTime: number;
}

export interface ReviewStats {
  total: number;
  averageRating: number | string;
  positive: number;
  negative: number;
}
