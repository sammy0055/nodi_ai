import React, { useState, useEffect } from 'react';
import {
  FiShoppingBag,
  FiDollarSign,
  FiRefreshCw,
  FiPackage,
  FiXCircle,
  FiClock,
  FiUser,
  FiStar,
  FiTrendingUp,
  FiActivity,
  FiSmile,
  FiFrown,
  FiCheckCircle,
  FiBarChart2,
} from 'react-icons/fi';
import { useLoaderData } from 'react-router';
import type { IOrganization } from '../../types/organization';
import { useValidateUserRolesAndPermissions } from '../../hooks/validateUserRoleAndPermissions';
import { useUserValue } from '../../store/authAtoms';
import { NotFoundPage } from '../../components/organisms/NotFoundPage';

// Types for dashboard data
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  processing: number;
  delivered: number;
  cancelled: number;
  pending: number;
}

export interface OrderAverageProcessingTime {
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

const DashboardPage: React.FC = () => {
  const data = useLoaderData() as {
    organization: IOrganization;
    orderStats: OrderStats;
    orderAvgProcessStats: OrderAverageProcessingTime[];
    reviewStats: ReviewStats;
  };
  // State for dashboard data
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
    pending: 0,
  });

  const [processingTimes, setProcessingTimes] = useState<OrderAverageProcessingTime[]>([]);
  const user = useUserValue();
  const { isUserPermissionsValid, isUserRoleValid } = useValidateUserRolesAndPermissions(user!);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    total: 847,
    averageRating: 4.7,
    positive: 789,
    negative: 58,
  });
  const [isAnimating] = useState(false);

  useEffect(() => {
    if (data) {
      setOrderStats(data.orderStats);
      setProcessingTimes(data.orderAvgProcessStats);
      setReviewStats(data.reviewStats);
    }
  }, [data]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Render star ratings
  const renderStars = (rating: number | string) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(numRating)) {
        stars.push(<FiStar key={i} className="text-yellow-400 fill-current" />);
      } else if (i === Math.ceil(numRating) && numRating % 1 > 0.3) {
        stars.push(<FiStar key={i} className="text-yellow-400 fill-current" />);
      } else {
        stars.push(<FiStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  // Get status icon and color
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered':
        return { icon: FiCheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'processing':
        return { icon: FiRefreshCw, color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case 'pending':
        return { icon: FiClock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'cancelled':
        return { icon: FiXCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
      default:
        return { icon: FiPackage, color: 'text-blue-600', bgColor: 'bg-blue-100' };
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // page permission protection
  if (!isUserRoleValid('super-admin')) {
    if (!isUserPermissionsValid(['dashboard.view'])) {
      return <NotFoundPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className={`transition-all duration-500 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-1">Monitor your order statistics and performance metrics</p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 transition-all duration-500 ${
            isAnimating ? 'opacity-50' : 'opacity-100'
          }`}
        >
          {/* Total Orders Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.totalOrders.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">All time orders</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <FiShoppingBag className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm text-blue-600">
              <FiTrendingUp className="mr-1" />
              <span>Active this week</span>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(orderStats.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">All time revenue</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <FiDollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <FiTrendingUp className="mr-1" />
              <span>Revenue growth</span>
            </div>
          </div>

          {/* Average Processing Time Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">38 min</p>
                <p className="text-xs text-gray-500 mt-1">Across all staff</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                <FiActivity className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm text-purple-600">
              <FiClock className="mr-1" />
              <span>Based on recent orders</span>
            </div>
          </div>

          {/* Processing Orders Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Processing Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.processing}</p>
                <p className="text-xs text-gray-500 mt-1">Currently in progress</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                <FiRefreshCw className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm text-purple-600">
              <FiClock className="mr-1" />
              <span>Active orders</span>
            </div>
          </div>

          {/* Delivered Orders Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Delivered Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.delivered}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully completed</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <FiPackage className="text-green-600" size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <FiCheckCircle className="mr-1" />
              <span>Successfully delivered</span>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <FiClock className="text-yellow-600" size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm text-yellow-600">
              <FiClock className="mr-1" />
              <span>Waiting to process</span>
            </div>
          </div>
        </div>

        {/* Middle Section - Processing Times and Reviews */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 transition-all duration-500 ${
            isAnimating ? 'opacity-50' : 'opacity-100'
          }`}
        >
          {/* Staff Processing Times */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              {processingTimes.map((staff, index) => {
                const Icon = getStatusConfig('processing').icon;
                return (
                  <div
                    key={staff.assignedUserId}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:translate-x-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                      <FiUser className="text-purple-600" size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{staff.assignedUserName}</p>
                      <p className="text-sm text-gray-500">Average processing time</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Icon className="text-purple-500 mr-2" size={16} />
                        <span className="font-bold text-gray-900">
                          {formatTime(Number(staff.averageEstimatedCompletionTime))}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Across all orders</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Team Average</span>
                <span className="font-bold text-gray-900">38 min</span>
              </div>
            </div>
          </div>

          {/* Reviews Statistics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-blue-700">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{reviewStats.total}</p>
                <div className="flex items-center mt-2 text-blue-600 text-sm">
                  <FiTrendingUp className="mr-1" />
                  <span>Customer feedback</span>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                <p className="text-sm text-yellow-700">Average Rating</p>
                <div className="flex items-center mt-1">
                  {renderStars(reviewStats.averageRating)}
                  <span className="ml-2 text-2xl font-bold text-yellow-900">{reviewStats.averageRating}</span>
                </div>
                <div className="text-sm text-yellow-600 mt-2">Out of 5.0 stars</div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Review Breakdown</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <FiSmile className="text-green-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Positive Reviews</p>
                      <p className="text-sm text-gray-500">Happy customers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{reviewStats.positive}</p>
                    <p className="text-sm text-green-600">Satisfied</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <FiFrown className="text-red-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Negative Reviews</p>
                      <p className="text-sm text-gray-500">Requires attention</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{reviewStats.negative}</p>
                    <p className="text-sm text-red-600">Needs improvement</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Satisfaction Rate</p>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${reviewStats.total ? (reviewStats.positive / reviewStats.total) * 100 : 0}%`,
                          transition: 'width 1s ease-out',
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-900">
                      {reviewStats.total ? ((reviewStats.positive / reviewStats.total) * 100).toFixed(1) + '%' : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Order Status Overview */}
        <div
          className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${
            isAnimating ? 'opacity-50' : 'opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center">
              <FiBarChart2 className="mr-2" />
              Order Status Overview
            </h3>
            <span className="text-sm text-gray-500">Current status distribution</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                status: 'delivered',
                count: orderStats.delivered,
                icon: FiCheckCircle,
                color: 'bg-green-500',
                textColor: 'text-green-600',
                bgColor: 'bg-green-50',
              },
              {
                status: 'processing',
                count: orderStats.processing,
                icon: FiRefreshCw,
                color: 'bg-purple-500',
                textColor: 'text-purple-600',
                bgColor: 'bg-purple-50',
              },
              {
                status: 'pending',
                count: orderStats.pending,
                icon: FiClock,
                color: 'bg-yellow-500',
                textColor: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
              },
              {
                status: 'cancelled',
                count: orderStats.cancelled,
                icon: FiXCircle,
                color: 'bg-red-500',
                textColor: 'text-red-600',
                bgColor: 'bg-red-50',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              const percentage = orderStats.totalOrders ? ((item.count / orderStats.totalOrders) * 100).toFixed(1) : 0;

              return (
                <div
                  key={item.status}
                  className={`p-4 rounded-lg border ${item.bgColor} border-gray-100 transition-all duration-300 transform hover:scale-105`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                      <Icon className={item.textColor} size={20} />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                      <p className="text-xs text-gray-500">orders</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium capitalize text-gray-900">{item.status} Orders</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{
                            width: `${percentage}%`,
                            transition: 'width 1s ease-out',
                          }}
                        ></div>
                      </div>
                      <span className={`font-bold ${item.textColor}`}>{percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{orderStats.totalOrders.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Overall Status</p>
                <p className="text-lg font-bold text-green-600">Active & Healthy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
