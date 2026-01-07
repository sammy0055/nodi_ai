import React, { useEffect, useRef, useState } from 'react';
import {
  FiSearch,
  FiUsers,
  FiPause,
  FiPlay,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiBox,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiMoreVertical,
  FiPlus,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useDebounce } from 'use-debounce';
import { useLoaderData } from 'react-router';
import { AdminOrganziationService } from '../../services/admin/AdminOrganizationService';
import type { Pagination } from '../../types/customer';
import Input from '../../components/atoms/Input/Input';
import { SubscriptionService } from '../../services/subscriptionService';

export type SubscriptionTypes =
  | 'suspend'
  | 'cancel'
  | 'reactivate'
  | 'cancel-subscription'
  | 'create-subscription'
  | 'add-credit'
  | 'remove-subscription'
  | 'reactivate-subscription';
// Types based on your schema
interface Organization {
  id: string;
  name: string;
  businessType: string;
  status: 'active' | 'suspended' | 'cancelled';
  createdAt: Date;
  subscription: {
    id: string;
    status: 'active' | 'suspended' | 'cancelled';
    startDate: Date;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    nextBillingDate: Date;
    plan: {
      id: string;
      name: string;
    };
  } | null;
  creditBalance: {
    id: string;
    totalCredits: number;
    usedCredits: number;
    remainingCredits: number;
  } | null;
}

interface Statistics {
  organizations: {
    total: string | null;
    plans: {
      starter: number;
      pro: number;
      enterprise: number;
      custom: number;
    };
    status: {
      active: string | null;
      suspended: string | null;
      cancelled: string | null;
    };
  };
}

const OrganizationsPage: React.FC = () => {
  const data = useLoaderData() as {
    organizations: any;
    adminOrganizations: { data: { data: Organization[]; pagination: Pagination } };
  };

  const [organizations, setOrganizations] = useState<Organization[]>(data.adminOrganizations.data.data);
  const [statistics] = useState<Statistics>({ organizations: data.organizations });
  const [searchTerm, setSearchTerm] = useState('');
  const [creditPoint, setCreditPoint] = useState('');
  const [pagination, setPagination] = useState<Pagination>(data.adminOrganizations.data.pagination);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<`${SubscriptionTypes}` | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const { adminCancelSubscription, adminCreateSubscription, addCreditPoint, adminUpdateSubscriptionStatus } =
    new SubscriptionService();
  // Filter organizations when search term changes
  const { adminGetPaginatedOrganizations, adminSearchOrganizations, updateOrganizationStatus } =
    new AdminOrganziationService();
  useEffect(() => {
    (async () => {
      if (!debouncedSearchTerm) {
        const { data } = await adminGetPaginatedOrganizations({ page: 1 });
        setOrganizations(data.data as any);
        setPagination(data.pagination);
        return;
      }

      const { data } = await adminSearchOrganizations(debouncedSearchTerm);
      setOrganizations(data.data as any);
      setPagination(data.pagination);
    })();
  }, [debouncedSearchTerm]);

  const handleOrgPagination = async (page: number) => {
    try {
      const { data } = await adminGetPaginatedOrganizations({ page });
      setOrganizations(data.data as any);
      setPagination(data.pagination);
    } catch (error: any) {
      alert('Something went wrong, please try again later');
    }
  };

  const handleAction = (org: Organization, type: SubscriptionTypes) => {
    setSelectedOrganization(org);
    setActionType(type);
    setShowActionModal(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (orgId: string) => {
    setOpenDropdownId(openDropdownId === orgId ? null : orgId);
  };

  const confirmAction = async () => {
    if (!selectedOrganization || !actionType) return;
    setIsLoading(true);

    try {
      // Simulate API call
      let updatedOrg = { ...selectedOrganization };
      switch (actionType) {
        case 'suspend':
          updatedOrg.status = 'suspended';
          await updateOrganizationStatus({ status: 'suspended', id: updatedOrg.id });
          break;
        case 'cancel':
          updatedOrg.status = 'cancelled';
          await updateOrganizationStatus({ status: 'cancelled', id: updatedOrg.id });
          break;
        case 'reactivate':
          updatedOrg.status = 'active';
          await updateOrganizationStatus({ status: 'active', id: updatedOrg.id });
          break;
        case 'cancel-subscription':
          await adminUpdateSubscriptionStatus({
            status: 'cancelled',
            subId: updatedOrg?.subscription?.id!,
            orgId: updatedOrg.id,
          });
          break;
        case 'reactivate-subscription':
          await adminUpdateSubscriptionStatus({
            status: 'active',
            subId: updatedOrg?.subscription?.id!,
            orgId: updatedOrg.id,
          });
          break;
        case 'remove-subscription':
          const subId = updatedOrg?.subscription?.id;
          if (!subId) {
            alert('organization does not have a subscription');
            return;
          }
          await adminCancelSubscription({ subId: subId!, orgId: updatedOrg.id });
          alert('subscription cancelled successfully');
          break;
        case 'create-subscription':
          await adminCreateSubscription({ orgId: updatedOrg.id, creditPoint: Number(creditPoint) });
          alert('subscription created successfully');
          break;
        case 'add-credit':
          await addCreditPoint({ organizationId: updatedOrg.id, creditPoint: Number(creditPoint) });
          alert('added billing credit successfully');
          break;
      }

      setOrganizations((prev) => prev.map((org) => (org.id === selectedOrganization.id ? updatedOrg : org)));
      setShowActionModal(false);
      setSelectedOrganization(null);
      setActionType(null);
    } catch (error) {
      alert('something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (planName: string | null) => {
    switch (planName?.toLowerCase()) {
      case 'starter':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-green-100 text-green-800';
      case 'custom':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    if (!date) return 'unlimited';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const getCreditUsagePercentage = (org: Organization) => {
    if (org.creditBalance && org.creditBalance.totalCredits > 0) {
      return (org.creditBalance.usedCredits / org.creditBalance.totalCredits) * 100;
    }
    return 0;
  };

  // Statistics Cards
  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({
    title,
    value,
    icon,
    color,
  }) => (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );

  // Fixed Action Dropdown Component
  const ActionDropdown: React.FC<{ org: Organization }> = ({ org }) => {
    const isOpen = openDropdownId === org.id;

    return (
      <div className="relative" ref={(el: any) => (dropdownRefs.current[org.id] = el)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleDropdown(org.id)}
          className="min-w-[40px] md:min-w-[80px] relative z-20"
        >
          <FiMoreVertical className="md:mr-1" />
          <span className="hidden md:inline">Actions</span>
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-neutral-200 z-50">
            <div className="py-1">
              {/* Organization Status Actions */}
              <div className="px-3 py-2 text-xs font-medium text-neutral-500 border-b border-neutral-200">
                Organization
              </div>

              {org.status === 'active' ? (
                <button
                  onClick={() => handleAction(org, 'suspend')}
                  className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <FiPause className="mr-2 text-yellow-600" />
                  Suspend Organization
                </button>
              ) : (
                <button
                  onClick={() => handleAction(org, 'reactivate')}
                  className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <FiPlay className="mr-2 text-green-600" />
                  Reactivate Organization
                </button>
              )}

              {/* Subscription Actions */}
              <div className="px-3 py-2 text-xs font-medium text-neutral-500 border-b border-neutral-200 mt-1">
                Subscription
              </div>

              {org?.subscription && org?.subscription?.status === 'active' && (
                <>
                  <button
                    onClick={() => handleAction(org, 'cancel-subscription')}
                    className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <FiPause className="mr-2 text-yellow-600" />
                    Cancel Subscription
                  </button>

                  <button
                    onClick={() => handleAction(org, 'remove-subscription')}
                    className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <FiPlus className="mr-2 text-yellow-600" />
                    Remove Subscription
                  </button>

                  <button
                    onClick={() => handleAction(org, 'add-credit')}
                    className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <FiPlus className="mr-2 text-yellow-600" />
                    Add Credit
                  </button>
                </>
              )}

              {org?.subscription && org?.subscription?.status !== 'active' && (
                <>
                  <button
                    onClick={() => handleAction(org, 'reactivate-subscription')}
                    className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <FiPlus className="mr-2 text-yellow-600" />
                    Reactivate Subscription
                  </button>
                </>
              )}

              {!org?.subscription && (
                <button
                  onClick={() => handleAction(org, 'create-subscription')}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FiXCircle className="mr-2" />
                  Create Subscription
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Organization Row Component with Dropdown
  const OrganizationRow: React.FC<{ org: Organization }> = ({ org }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
      {/* Organization Info - 4 columns */}
      <div className="md:col-span-4 flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiUsers className="text-primary-600 text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-1 flex-wrap">
            <h4 className="font-medium text-neutral-900 truncate">{org.name}</h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                org.status
              )}`}
            >
              {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-neutral-500 truncate">{org.businessType}</p>
          <p className="text-xs text-neutral-400 truncate">ID: {org.id}</p>
        </div>
      </div>

      {/* Subscription Details - 3 columns */}
      <div className="md:col-span-3 hidden md:block">
        {org?.subscription ? (
          <div className="space-y-1 text-sm">
            {org?.subscription?.plan && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Plan:</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPlanColor(
                    org.subscription.plan.name
                  )}`}
                >
                  {org.subscription.plan.name}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Subscription:</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                  org.subscription.status
                )}`}
              >
                {org.subscription.status.charAt(0).toUpperCase() + org.subscription.status.slice(1)}
              </span>
            </div>
            <div className="text-neutral-500 text-xs">Next billing: {formatDate(org.subscription.nextBillingDate)}</div>
          </div>
        ) : (
          <div className="text-sm text-neutral-400">No subscription</div>
        )}
      </div>

      {/* Credit Usage - 3 columns */}
      <div className="md:col-span-3 hidden md:block">
        {org.creditBalance ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Credits:</span>
              <span className="font-medium">
                {formatCurrency(org.creditBalance.remainingCredits)} / {formatCurrency(org.creditBalance.totalCredits)}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getCreditUsagePercentage(org), 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-neutral-500 text-right">{getCreditUsagePercentage(org).toFixed(1)}% used</div>
          </div>
        ) : (
          <div className="text-sm text-neutral-400">No credit data</div>
        )}
      </div>

      {/* Actions - 2 columns */}
      <div className="md:col-span-2 flex justify-end relative">
        <ActionDropdown org={org} />
      </div>

      {/* Mobile details */}
      <div className="md:hidden col-span-1 space-y-3">
        {org.subscription && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {org.subscription.plan && (
              <div>
                <p className="text-neutral-500">Plan</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPlanColor(
                    org.subscription.plan.name
                  )}`}
                >
                  {org.subscription.plan.name}
                </span>
              </div>
            )}
            <div>
              <p className="text-neutral-500">Subscription</p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                  org.subscription.status
                )}`}
              >
                {org.subscription.status}
              </span>
            </div>
            <div>
              <p className="text-neutral-500">Credits Used</p>
              <p className="font-medium">{getCreditUsagePercentage(org).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-neutral-500">Next Billing</p>
              <p className="font-medium text-sm">{formatDate(org.subscription.nextBillingDate)}</p>
            </div>
          </div>
        )}
        {!org.subscription && <div className="text-sm text-neutral-400 text-center">No subscription data</div>}

        <div className="flex justify-end">
          <ActionDropdown org={org} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Organizations</h2>
          <p className="text-neutral-600 mt-1">Manage organizations and their subscriptions</p>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Organizations"
          value={statistics.organizations.total ? parseInt(statistics.organizations.total) : 0}
          icon={<FiUsers className="text-blue-600 text-xl" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Active Organizations"
          value={statistics.organizations.status.active ? parseInt(statistics.organizations.status.active) : 0}
          icon={<FiCheckCircle className="text-green-600 text-xl" />}
          color="bg-green-50"
        />
        <StatCard
          title="Suspended"
          value={statistics.organizations.status.suspended ? parseInt(statistics.organizations.status.suspended) : 0}
          icon={<FiPause className="text-yellow-600 text-xl" />}
          color="bg-yellow-50"
        />
        <StatCard
          title="Cancelled"
          value={statistics.organizations.status.cancelled ? parseInt(statistics.organizations.status.cancelled) : 0}
          icon={<FiXCircle className="text-red-600 text-xl" />}
          color="bg-red-50"
        />
      </div>

      {/* Plan Distribution */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Plan Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statistics.organizations.plans).map(([plan, count]) => (
            <div key={plan} className="text-center p-4 border border-neutral-200 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{count}</div>
              <div className="text-sm text-neutral-600 capitalize mt-1">{plan}</div>
              <div className="text-xs text-neutral-500">
                {statistics.organizations.total && parseInt(statistics.organizations.total) > 0
                  ? ((count / parseInt(statistics.organizations.total)) * 100).toFixed(1)
                  : '0.0'}
                %
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Organizations List */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <h3 className="text-lg font-semibold text-neutral-900">Organization Management</h3>
            <div className="relative md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search by organization name or ID..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Organizations List */}
        <div className="overflow-x-auto">
          {/* Header Row - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-sm font-medium text-neutral-700">
            <div className="col-span-4">Organization</div>
            <div className="col-span-3">Subscription Details</div>
            <div className="col-span-3">Credit Usage</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Organizations Items */}
          {organizations.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <FiBox className="mx-auto text-4xl text-neutral-300 mb-3" />
              <p>No organizations found{searchTerm && ` matching "${searchTerm}"`}</p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2">
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 min-w-full">
              {organizations.map((org) => (
                <OrganizationRow key={org.id} org={org} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0 bg-white">
              <div className="text-sm text-neutral-500">
                Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                {pagination.totalItems} organizations
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handleOrgPagination(pagination.currentPage - 1)}
                >
                  <FiChevronLeft className="mr-1" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;

                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    if (pageNum < 1 || pageNum > pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          pageNum === pagination.currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                        onClick={() => handleOrgPagination(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => handleOrgPagination(pagination.currentPage + 1)}
                >
                  Next
                  <FiChevronRight className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedOrganization && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">
                {actionType === 'suspend' && 'Suspend Organization'}
                {actionType === 'cancel' && 'Cancel Organization'}
                {actionType === 'reactivate' && 'Reactivate Organization'}
                {actionType === 'cancel-subscription' && 'Cancel Subscription'}
                {actionType === 'create-subscription' && 'Create Subscription'}
                {actionType === 'reactivate-subscription' && 'Reactivate Subscription'}
                {actionType === 'remove-subscription' && 'Remove Subscription'}
                {actionType === 'add-credit' && 'Add Credit'}
              </h3>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedOrganization(null);
                  setActionType(null);
                }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                {actionType !== 'add-credit' && <FiAlertCircle className="text-yellow-600 mr-3 text-xl" />}
                <div>
                  <h4 className="font-medium text-neutral-900">Confirm Action</h4>
                  <p className="text-sm text-neutral-600 mt-1">
                    {actionType === 'suspend' &&
                      `Are you sure you want to suspend ${selectedOrganization.name}? They will lose access to the platform.`}
                    {actionType === 'cancel' &&
                      `Are you sure you want to cancel ${selectedOrganization.name}? This action cannot be undone.`}
                    {actionType === 'reactivate' &&
                      `Are you sure you want to reactivate ${selectedOrganization.name}? They will regain access to the platform.`}
                    {actionType === 'cancel-subscription' &&
                      `Are you sure you want to cancel ${selectedOrganization.name}'s subscription? They will lose access to premium features.`}
                    {actionType === 'remove-subscription' &&
                      `Are you sure you want to remove ${selectedOrganization.name}'s subscription? They will lose access to premium features.`}
                    {actionType === 'create-subscription' &&
                      `Are you sure you want to create ${selectedOrganization.name}'s subscription? This action cannot be undone.`}
                    {actionType === 'reactivate-subscription' &&
                      `Are you sure you want to reactivate ${selectedOrganization.name}'s subscription? This action cannot be undone.`}
                  </p>

                  {actionType === 'create-subscription' && (
                    <Input
                      type="number"
                      value={creditPoint}
                      onChange={(e) => setCreditPoint(e.target.value)}
                      label="Credit Point"
                    />
                  )}
                  {actionType === 'add-credit' && (
                    <Input
                      type="number"
                      value={creditPoint}
                      onChange={(e) => setCreditPoint(e.target.value)}
                      label="Credit Point"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedOrganization(null);
                    setActionType(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionType.includes('cancel') ? 'danger' : 'primary'}
                  onClick={confirmAction}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  {actionType === 'suspend' && 'Suspend Organization'}
                  {actionType === 'cancel' && 'Cancel Organization'}
                  {actionType === 'reactivate' && 'Reactivate Organization'}
                  {actionType === 'cancel-subscription' && 'Cancel Subscription'}
                  {actionType === 'create-subscription' && 'Create Subscription'}
                  {actionType === 'reactivate-subscription' && 'Reactivate Subscription'}
                  {actionType === 'remove-subscription' && 'Remove Subscription'}
                  {actionType === 'add-credit' && 'Add Credit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;
