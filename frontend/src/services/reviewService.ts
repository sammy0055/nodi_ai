import type { IReviews, OrgReviewQuestions } from '../pages/tenant/ReviewPage';
import type { Pagination } from '../types/customer';
import type { IOrganization } from '../types/organization';
import { API_ROUTES, ApiClient } from './apiClient';

interface GetReviewsParams {
  page?: number;
  search?: string;
  rating?: number;
  branch?: string;
  serviceType?: 'takeaway' | 'delivery';
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
    searchTerm: string
  ): Promise<{ data: { data: IReviews[]; pagination: Pagination }; message: string }> {
    const response = await fetch(`${API_ROUTES.GET_REVIEWS}?searchQuery=${searchTerm}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = `${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        throw new Error(errorMessage);
      }
    }

    return await response.json();
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
}
