import React, { useEffect, useState } from 'react';
import {
  FiSearch,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiShoppingBag,
  FiMapPin,
  FiPackage,
  FiMessageSquare,
  FiThumbsUp,
  FiThumbsDown,
  FiClock,
  FiEye,
  FiX,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
// import Input from '../../components/atoms/Input/Input';
import { useDebounce } from 'use-debounce';
import { useReviewValue } from '../../store/authAtoms';

// Types based on your schema
export interface IReview {
  id: string;
  orgainzationId: string;
  customerId: string;
  orderId: string;
  rating: number;
  comment: string;
  customer: {
    id: string;
    name: string;
  };
  order: {
    id: string;
    totalAmount: number;
    serviceType: 'delivery' | 'takeaway';
    branch: {
      id: string;
      name: string;
    };
    items: {
      id: string;
      quantity: number;
      product: { name: string };
    }[];
  };
  createdAt?: Date;
}



const ReviewsPage: React.FC = () => {
  const reviews = useReviewValue();
  const [filteredReviews, setFilteredReviews] = useState<IReview[]>(reviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<'all' | 'delivery' | 'takeaway'>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Get unique branches for filter
  const branches = Array.from(new Set(reviews.map((review) => review.order.branch.name)));

  // Filter reviews when search term or filters change
  useEffect(() => {
    let filtered = reviews;

    // Filter by search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.customer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          review.order.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          review.order.branch.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Filter by rating
    if (selectedRating !== 'all') {
      filtered = filtered.filter((review) => review.rating === selectedRating);
    }

    // Filter by service type
    if (selectedServiceType !== 'all') {
      filtered = filtered.filter((review) => review.order.serviceType === selectedServiceType);
    }

    // Filter by branch
    if (selectedBranch !== 'all') {
      filtered = filtered.filter((review) => review.order.branch.name === selectedBranch);
    }

    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedRating, selectedServiceType, selectedBranch, reviews]);

  const handleViewReview = (review: IReview) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5:
        return 'bg-green-100 text-green-800';
      case 4:
        return 'bg-blue-100 text-blue-800';
      case 3:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-orange-100 text-orange-800';
      case 1:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4) return <FiThumbsUp className="text-green-600" />;
    if (rating === 3) return <FiThumbsUp className="text-yellow-600" />;
    return <FiThumbsDown className="text-red-600" />;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            size={16}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-900">({rating}.0)</span>
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage: (reviews.filter((review) => review.rating === rating).length / reviews.length) * 100,
  }));

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const currentReviews = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Review Card Component
  const ReviewCard: React.FC<{ review: IReview }> = ({ review }) => (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FiUser className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{review.customer.name}</h3>
              <p className="text-sm text-neutral-500">Order: {review.order.id}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingColor(
              review.rating
            )}`}
          >
            {getRatingIcon(review.rating)}
            <span className="ml-1">{review.rating}.0</span>
          </span>
        </div>

        {/* Rating Stars */}
        <div className="mb-3">{renderStars(review.rating)}</div>

        {/* Comment */}
        <div className="mb-4">
          <p className="text-neutral-700 text-sm line-clamp-3">{review.comment}</p>
        </div>

        {/* Order Details */}
        <div className="space-y-2 text-sm text-neutral-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiShoppingBag className="mr-2" size={14} />
              <span>
                {review.order.items.length} item{review.order.items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="font-semibold text-neutral-900">{formatCurrency(review.order.totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiMapPin className="mr-2" size={14} />
              <span>{review.order.branch.name}</span>
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                review.order.serviceType === 'delivery' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {review.order.serviceType === 'delivery' ? 'Delivery' : 'Takeaway'}
            </span>
          </div>
          {review.createdAt && (
            <div className="flex items-center text-xs text-neutral-500">
              <FiClock className="mr-1" size={12} />
              <span>{formatDate(review.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <Button variant="outline" size="sm" onClick={() => handleViewReview(review)} className="w-full">
            <FiEye className="mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Customer Reviews</h2>
          <p className="text-neutral-600 mt-1">Manage and monitor customer feedback</p>
        </div>

        {/* Statistics */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{averageRating.toFixed(1)}</div>
            <div className="text-neutral-500">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900">{totalReviews}</div>
            <div className="text-neutral-500">Total Reviews</div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm font-medium text-neutral-600">{rating}</span>
                <FiStar className="text-yellow-400 fill-current" size={14} />
              </div>
              <div className="flex-1 bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-neutral-600 w-16 text-right">
                {count} ({percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-medium p-4">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search reviews by customer, comment, order ID, or branch..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Rating Filter */}
            <div className="relative">
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none pr-8 w-full sm:w-auto"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <FiStar size={14} />
              </div>
            </div>

            {/* Service Type Filter */}
            <div className="relative">
              <select
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value as any)}
                className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none pr-8 w-full sm:w-auto"
              >
                <option value="all">All Services</option>
                <option value="delivery">Delivery</option>
                <option value="takeaway">Takeaway</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <FiPackage size={14} />
              </div>
            </div>

            {/* Branch Filter */}
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none pr-8 w-full sm:w-auto"
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <FiMapPin size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Customer Reviews ({filteredReviews.length})</h3>
            {searchTerm && (
              <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </div>
        </div>

        {/* Reviews */}
        {currentReviews.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <FiMessageSquare className="mx-auto text-4xl text-neutral-300 mb-3" />
            <p>No reviews found{searchTerm && ` matching "${searchTerm}"`}</p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
              {currentReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0">
                <div className="text-sm text-neutral-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <FiChevronLeft className="mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          className={`px-3 py-1 rounded text-sm ${
                            pageNum === currentPage
                              ? 'bg-primary-600 text-white'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                    <FiChevronRight className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Details Modal */}
      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">Review Details</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedReview(null);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer & Rating */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">{selectedReview.customer.name}</h4>
                    <p className="text-sm text-neutral-500">Customer</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">{renderStars(selectedReview.rating)}</div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRatingColor(
                      selectedReview.rating
                    )}`}
                  >
                    {getRatingIcon(selectedReview.rating)}
                    <span className="ml-1">{selectedReview.rating}.0 Rating</span>
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-2">Customer Feedback</h4>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-neutral-700 leading-relaxed">{selectedReview.comment}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Order Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Order ID:</span>
                      <span className="font-medium">{selectedReview.order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Total Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedReview.order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Service Type:</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          selectedReview.order.serviceType === 'delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {selectedReview.order.serviceType === 'delivery' ? 'Delivery' : 'Takeaway'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Branch:</span>
                      <span className="font-medium">{selectedReview.order.branch.name}</span>
                    </div>
                    {selectedReview.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Review Date:</span>
                        <span className="font-medium">{formatDate(selectedReview.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedReview.order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedReview(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
