import React, { useState, useEffect, useMemo } from 'react';
import {
  FiStar,
  FiMessageSquare,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFilter,
  FiSearch,
  FiChevronRight,
  FiThumbsUp,
  FiThumbsDown,
  FiUser,
  FiCalendar,
  FiPackage,
  FiCheck,
  FiX,
  FiAlertCircle,
  // FiTrendingUp,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useDebounce } from 'use-debounce';
import { ReviewService } from '../../services/reviewService';
import uuid from 'react-uuid';
import { useLoaderData, useNavigate } from 'react-router';
import type { IOrganization } from '../../types/organization';
import ReviewDatePicker from '../../components/organisms/review/reviewDataPicker';
import type { Pagination } from '../../types/customer';
import { useUserValue } from '../../store/authAtoms';
import { useValidateUserRolesAndPermissions } from '../../hooks/validateUserRoleAndPermissions';

export interface OrgReviewQuestions {
  id: string;
  question: string;
  answer: string | null;
}

export interface IReviews {
  id: string; // uuid
  organizationId: string;
  customerId: string;
  orderId: string;
  rating: number; //scale of 1 to 5
  items: OrgReviewQuestions[];
  createdAt: Date;
  customer: {
    id: string;
    name: string;
    email?: string;
  };
  order: {
    id: string;
    totalAmount: number;
    currency: string;
  };
}

const ReviewsPage: React.FC = () => {
  const data = useLoaderData() as {
    reviews: { data: { data: IReviews[]; pagination: Pagination } };
    organization: IOrganization;
  };

  const user = useUserValue();
  const { isUserPermissionsValid, isUserRoleValid } = useValidateUserRolesAndPermissions(user!);
  const navigate = useNavigate();
  // State for review questions
  const [reviewQuestions, setReviewQuestions] = useState<OrgReviewQuestions[]>([]);

  // State for reviews
  const [reviews, setReviews] = useState<IReviews[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // State for form and UI
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<OrgReviewQuestions | null>(null);
  const [editText, setEditText] = useState('');
  const [activeTab, setActiveTab] = useState<'questions' | 'reviews'>('reviews');
  const [searchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<IReviews | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [reviewTime, setReviewTime] = useState<number | null>(null);
  // const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const { setOrgReviewQuestions, setOrgReviewTimer, searchReviews } = new ReviewService();

  // initialize data
  useEffect(() => {
    if (data?.organization?.reviewQuestions) {
      setReviewQuestions(data.organization.reviewQuestions);
      setReviewTime(data.organization.reviewTimer || null);
    }
    if (data.reviews.data) {
      setReviews(data.reviews.data.data);
      setPagination(data.reviews.data.pagination);
    }
  }, [data]);

  // CRUD Operations for Review Questions
  const handleAddQuestion = async () => {
    if (!isUserRoleValid('super-admin')) {
      if (!isUserPermissionsValid(['review.create'])) {
        alert("you don't have permission to create review question");
        return;
      }
    }
    if (!newQuestion.trim()) return;

    try {
      const newQuestionObj: OrgReviewQuestions = {
        id: uuid(),
        question: newQuestion.trim(),
        answer: null,
      };

      await setOrgReviewQuestions([...reviewQuestions, newQuestionObj]);
      setReviewQuestions((prev) => [...prev, newQuestionObj]);
      setNewQuestion('');
      setShowQuestionModal(false);
    } catch (error: any) {
      alert('something went wrong, kindly try again');
      console.error(error);
    }
  };

  const handleEditQuestion = async () => {
    if (!isUserRoleValid('super-admin')) {
      if (!isUserPermissionsValid(['review.update'])) {
        alert("you don't have permission to update review question");
        return;
      }
    }
    if (!editingQuestion || !editText.trim()) return;

    try {
      const updatedReviewQuestions = reviewQuestions.map((r) =>
        r.id === editingQuestion.id ? { ...r, question: editText.trim() } : r
      );

      await setOrgReviewQuestions(updatedReviewQuestions);
      setReviewQuestions(updatedReviewQuestions);

      setEditingQuestion(null);
      setEditText('');
    } catch (error: any) {
      alert('something went wrong, kindly try again');
      console.error(error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!isUserRoleValid('super-admin')) {
      if (!isUserPermissionsValid(['review.delete'])) {
        alert("you don't have permission to delete review question");
        return;
      }
    }
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const updatedReviewQuestions = reviewQuestions.filter((q) => q.id !== id);
        await setOrgReviewQuestions(updatedReviewQuestions);
        setReviewQuestions(updatedReviewQuestions);
      } catch (error: any) {
        alert('something went wrong, kindly try again');
        console.error(error);
      }
    }
  };

  const startEditQuestion = (question: OrgReviewQuestions) => {
    setEditingQuestion(question);
    setEditText(question.question);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
    const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
    const negativeReviews = reviews.filter((r) => r.rating <= 2).length;
    const neutralReviews = reviews.filter((r) => r.rating === 3).length;

    // Rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((r) => r.rating === rating).length,
      percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
    }));

    return {
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      positiveReviews,
      negativeReviews,
      neutralReviews,
      ratingDistribution,
    };
  }, [reviews]);

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date && date));
  };

  // Render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`${
          i < rating
            ? rating >= 4
              ? 'text-yellow-400 fill-yellow-400'
              : rating >= 3
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-red-400 fill-red-400'
            : 'text-gray-300'
        }`}
        size={16}
      />
    ));
  };

  // Handle view review
  const handleViewReview = (review: IReviews) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  // Handle reset filters
  // const handleResetFilters = () => {
  //   setSearchTerm('');
  //   setSelectedRating('all');
  // };

  const handleSetReviewTimer = async (timer: number) => {
    try {
      await setOrgReviewTimer(timer);
    } catch (error: any) {
      alert('something went wrong, try again');
    }
  };

  const getFilteredReviews = async (page = 1, restData: boolean = false) => {
    const filter: any = { page };
    if (selectedRating !== 'all') filter.rating = selectedRating;
    if (searchTerm) filter.searchTerm = searchTerm;

    const data = await searchReviews(filter);
    if (restData) {
      setReviews((prevState) => [...prevState, ...data.data.data]);
      setPagination(data.data.pagination);
    } else {
      setReviews(data.data.data || []);
      setPagination(data.data.pagination);
    }
  };
  const [debouncedTerm] = useDebounce(searchTerm, 500); // 500ms delay
  useEffect(() => {
    getFilteredReviews();
  }, [selectedRating, debouncedTerm]);

  if (!isUserRoleValid('super-admin')) {
    if (!isUserPermissionsValid(['review.view'])) navigate(-1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
            <p className="text-gray-600 mt-1">Manage review questions and monitor customer feedback</p>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReviews}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <FiMessageSquare className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <FiTrendingUp className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{stats.positiveReviews} positive</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageRating.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <FiStar className="text-yellow-600" size={24} />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-4">
              <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positive Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.positiveReviews}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <FiThumbsUp className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(stats.positiveReviews / stats.totalReviews) * 100 || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Negative Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.negativeReviews}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <FiThumbsDown className="text-red-600" size={24} />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(stats.negativeReviews / stats.totalReviews) * 100 || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div> */}

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {stats.ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center">
                <div className="flex items-center w-16">
                  <span className="text-sm font-medium text-gray-600 mr-2">{rating}</span>
                  <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
                </div>
                <div className="flex-1 ml-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <span className="text-sm text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center border-b-2 transition-all ${
                  activeTab === 'reviews'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiMessageSquare className="mr-2" />
                Customer Reviews
                <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                  {reviews.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('questions')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center border-b-2 transition-all ${
                  activeTab === 'questions'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiMessageSquare className="mr-2" />
                Review Questions
                <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                  {reviewQuestions.length}
                </span>
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {/* {activeTab === 'reviews' && <FiSearch className="text-gray-400" />} */}
                  </div>
                  {activeTab === 'reviews' ? (
                    <></>
                  ) : (
                    // <input
                    //   type="text"
                    //   placeholder={
                    //     activeTab === 'reviews'
                    //       ? 'Search reviews, customers, or order numbers...'
                    //       : 'Search questions...'
                    //   }
                    //   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    //   value={searchTerm}
                    //   onChange={(e) => setSearchTerm(e.target.value)}
                    // />
                    <ReviewDatePicker
                      value={reviewTime}
                      onChange={setReviewTime}
                      submit={handleSetReviewTimer}
                      label="Review After"
                      placeholder="Set when to review"
                      minMinutes={0}
                      maxMinutes={1440}
                      showHours={true}
                      showMinutes={true}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {activeTab === 'reviews' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? 'bg-gray-100' : ''}
                  >
                    <FiFilter className="mr-2" />
                    Filters
                  </Button>
                )}

                {activeTab === 'questions' && (
                  <Button onClick={() => setShowQuestionModal(true)}>
                    <FiPlus className="mr-2" />
                    Add Question
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters for Reviews */}
            {showFilters && activeTab === 'reviews' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <select
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                  </div> */}
                </div>

                {/* {selectedRating !== 'all' && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Clear all filters
                    </Button>
                  </div>
                )} */}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'questions' ? (
              // Review Questions Management
              <div className="space-y-4">
                {editingQuestion ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-medium text-yellow-800 mb-3">Edit Question</h3>
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Enter your review question..."
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleEditQuestion} className="bg-green-600 hover:bg-green-700">
                          <FiCheck className="mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingQuestion(null);
                            setEditText('');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <FiX className="mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reviewQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{question.question}</h4>
                          <p className="text-sm text-gray-500 mt-1">ID: {question.id}</p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditQuestion(question)}
                            className="!p-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <FiEdit2 size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="!p-1.5 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <FiMessageSquare className="mr-1" size={10} />
                          Review Question
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Reviews List
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiSearch className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {searchTerm
                        ? `No reviews match "${searchTerm}". Try a different search term or clear filters.`
                        : 'No reviews available.'}
                    </p>
                    {/* {(searchTerm || selectedRating !== 'all') && (
                      <Button variant="outline" onClick={handleResetFilters} className="mt-4">
                        Clear all filters
                      </Button>
                    )} */}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className={`bg-white border rounded-lg p-4 hover:shadow-lg transition-all duration-200 ${
                            review.rating < 3
                              ? 'border-red-200 bg-red-50'
                              : review.rating === 3
                              ? 'border-yellow-200'
                              : 'border-green-200'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between">
                            {/* Left Section */}
                            <div className="flex-1">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                                    {review.customer.name ? (
                                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-500 text-white font-bold">
                                        {review.customer.name?.charAt(0).toUpperCase() || 'A'}
                                      </div>
                                    ) : (
                                      <FiUser className="text-blue-600" size={20} />
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h3 className="text-sm font-semibold text-gray-900">{review.customer.name}</h3>
                                    <div className="flex items-center">
                                      {renderStars(review.rating)}
                                      <span className="ml-2 text-sm font-medium text-gray-900">{review.rating}.0</span>
                                    </div>
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        review.rating >= 4
                                          ? 'bg-green-100 text-green-800'
                                          : review.rating === 3
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {review.rating >= 4 ? 'Positive' : review.rating === 3 ? 'Neutral' : 'Negative'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                                    <div className="flex items-center text-gray-600">
                                      <FiPackage className="mr-2 text-gray-400" size={14} />
                                      <span className="truncate">{review.order.id}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <FiCalendar className="mr-2 text-gray-400" size={14} />
                                      <span>{formatDate(review?.createdAt)}</span>
                                    </div>
                                  </div>

                                  {/* Review Questions & Answers */}
                                  <div className="space-y-2 mt-3">
                                    {review.items.map((item, index) => (
                                      <div key={index} className="bg-white rounded border border-gray-100 p-3">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="text-sm font-medium text-gray-900">{item.question}</p>
                                            <p
                                              className={`text-sm mt-1 ${
                                                item.answer === 'Yes'
                                                  ? 'text-green-600'
                                                  : item.answer === 'No'
                                                  ? 'text-red-600'
                                                  : 'text-yellow-600'
                                              }`}
                                            >
                                              {item.answer || 'No answer provided'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Section */}
                            <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
                              <div className="text-right mb-3">
                                <p className="text-lg font-bold text-gray-900">
                                  {review.order.currency} {review.order.totalAmount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Order Total</p>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReview(review)}
                                className="border-gray-300 hover:border-gray-400"
                              >
                                <FiEye className="mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination?.totalPages! > 1 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              getFilteredReviews(pagination?.currentPage && pagination?.currentPage + 1, true)
                            }
                            disabled={!pagination?.hasNextPage}
                            className="px-3 py-1"
                          >
                            load more
                            <FiChevronRight className="ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Review Question</h3>
              <p className="text-sm text-gray-600 mt-1">Questions will be shown to customers after their orders</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter your review question..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <FiAlertCircle className="text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Tip</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Keep questions simple and focused on specific aspects of the customer experience.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQuestionModal(false);
                    setNewQuestion('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim()}
                  // className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <FiPlus className="mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Review Details</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Order {selectedReview.order.id} • {selectedReview.customer.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedReview(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Review Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiUser className="mr-2" />
                      Customer Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{selectedReview.customer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium">{selectedReview.customer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Customer ID:</span>
                        <span className="font-medium">{selectedReview.customerId}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-lg p-4 ${
                      selectedReview.rating < 3
                        ? 'bg-red-50 border border-red-200'
                        : selectedReview.rating === 3
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-green-50 border border-green-200'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiStar className="mr-2" />
                      Rating Summary
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Overall Rating:</span>
                        <div className="flex items-center">
                          {renderStars(selectedReview.rating)}
                          <span className="ml-2 text-lg font-bold text-gray-900">{selectedReview.rating}.0</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Status:</span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedReview.rating >= 4
                              ? 'bg-green-100 text-green-800'
                              : selectedReview.rating === 3
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {selectedReview.rating >= 4
                            ? 'Positive Review'
                            : selectedReview.rating === 3
                            ? 'Neutral Review'
                            : 'Needs Attention'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiPackage className="mr-2" />
                      Order Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order ID:</span>
                        <span className="font-medium">{selectedReview.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Total:</span>
                        <span className="font-medium">
                          {selectedReview.order.currency} {selectedReview.order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiCalendar className="mr-2" />
                      Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Review Date:</span>
                        <span className="font-medium">{formatDate(selectedReview.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Organization: </span>
                        <span className="font-medium"> {selectedReview.organizationId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Questions & Answers */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">
                  Review Questions & Answers ({selectedReview.items.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReview.items.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-2">{item.question}</h5>
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              item.answer === 'Yes'
                                ? 'bg-green-100 text-green-800'
                                : item.answer === 'No'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {item.answer === 'Yes' && <FiThumbsUp className="mr-2" />}
                            {item.answer === 'No' && <FiThumbsDown className="mr-2" />}
                            {item.answer === 'Neutral' && <FiAlertCircle className="mr-2" />}
                            {item.answer || 'No Answer'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
