import type { IReviews, OrgReviewQuestions } from '../pages/tenant/ReviewPage';
import type { Pagination } from '../types/customer';
import type { IOrganization } from '../types/organization';
import type { ReviewStats } from '../types/stats';
import { ApiClient } from './apiClient';

interface GetReviewsParams {
  page?: number;
  search?: string;
  rating?: number;
  branch?: string;
  serviceType?: 'takeaway' | 'delivery';
  searchTerm?: string;
}

export class ReviewService {
  async getReviews(
    params: GetReviewsParams
  ): Promise<{ data: { data: IReviews[]; pagination: Pagination }; message: string }> {
    return await ApiClient('GET_REVIEWS', {
      queryParams: `?page=${encodeURIComponent(params.page || 1)}&searchQuery=${encodeURIComponent(
        params.search || ''
      )}&rating=${encodeURIComponent(params.rating || 0)}`,
    });
  }

  async searchReviews(
    params: GetReviewsParams
  ): Promise<{ data: { data: IReviews[]; pagination: Pagination }; message: string }> {
    return await ApiClient('GET_REVIEWS', {
      queryParams: `?searchQuery=${encodeURIComponent(params.searchTerm || '')}&rating=${params.rating}&page=${
        params.page || 1
      }`,
    });
  }

  async setOrgReviewQuestions(data: OrgReviewQuestions[]): Promise<{ data: IOrganization; message: string }> {
    return await ApiClient('SET_ORG_REVIEW_QUESTIONS', {
      method: 'POST',
      body: data,
    });
  }

  async setOrgReviewTimer(timer: number): Promise<{ data: IOrganization; message: string }> {
    return await ApiClient('SET_ORG_REVIEW_TIMER', {
      method: 'POST',
      body: { timer: timer },
    });
  }

  async getReviewStats(): Promise<{ data: ReviewStats }> {
    return ApiClient('GET_REVIEWS_STATS');
  }
}
