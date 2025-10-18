import type { IReview } from '../pages/tenant/ReviewPage';
import type { Pagination } from '../types/customer';
import { API_ROUTES, ApiClient } from './apiClient';

export class ReviewService {
  async getReviews(): Promise<{ data: { data: IReview[], pagination: Pagination }; message: string }> {
    return await ApiClient('GET_REVIEWS');
  }
  async searchReviews(
    searchTerm: string
  ): Promise<{ data: { data: IReview[]; pagination: Pagination }; message: string }> {
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
}
