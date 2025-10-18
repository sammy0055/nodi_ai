import express from 'express';
import { APIResponseFormat } from '../types/apiTypes';
import { errorLogger } from '../helpers/logger';
import { authMiddleware } from '../middleware/authentication';
import { ReviewService } from '../services/review.service';
export const reviewRoute = express.Router();

reviewRoute.get('/get-reviews', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = req.query.searchQuery || '';

    // calculate offset
    const offset = (page - 1) * limit;
    const data = await ReviewService.getReviewsByOrganization(
      req.user!,
      { page, limit, offset },
      searchQuery as string
    );
    const response: APIResponseFormat<any> = {
      message: 'reviews retrieved successfully',
      data,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});
