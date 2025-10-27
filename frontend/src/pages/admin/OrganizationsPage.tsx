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
  FiRefreshCw,
  FiMoreVertical,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useDebounce } from 'use-debounce';

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
    creditBalance: {
      id: string;
      totalCredits: number;
      usedCredits: number;
      remainingCredits: number;
    };
  };
}

interface Statistics {
  organizations: {
    total: number;
    plans: {
      starter: number;
      pro: number;
      enterprise: number;
      custom: number;
    };
    status: {
      active: number;
      suspended: number;
      cancelled: number;
    };
  };
}

// Mock data
const mockStatistics: Statistics = {
  organizations: {
    total: 50,
    plans: {
      starter: 15,
      pro: 20,
      enterprise: 12,
      custom: 3,
    },
    status: {
      active: 42,
      suspended: 5,
      cancelled: 3,
    },
  },
};

const mockOrganizations: Organization[] = [
  {
    id: 'ORG-001',
    name: 'Mike Enterprise',
    businessType: 'Mobile Shop',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    subscription: {
      id: 'SUB-001',
      status: 'active',
      startDate: new Date('2024-01-15'),
      currentPeriodStart: new Date('2024-02-01'),
      currentPeriodEnd: new Date('2024-03-01'),
      nextBillingDate: new Date('2024-03-01'),
      plan: {
        id: 'plan-2',
        name: 'Professional',
      },
      creditBalance: {
        id: 'CRED-001',
        totalCredits: 5000,
        usedCredits: 1250,
        remainingCredits: 3750,
      },
    },
  },
  {
    id: 'ORG-002',
    name: 'Tech Solutions Inc',
    businessType: 'IT Services',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    subscription: {
      id: 'SUB-002',
      status: 'active',
      startDate: new Date('2024-01-20'),
      currentPeriodStart: new Date('2024-02-01'),
      currentPeriodEnd: new Date('2024-03-01'),
      nextBillingDate: new Date('2024-03-01'),
      plan: {
        id: 'plan-3',
        name: 'Enterprise',
      },
      creditBalance: {
        id: 'CRED-002',
        totalCredits: 20000,
        usedCredits: 8500,
        remainingCredits: 11500,
      },
    },
  },
  {
    id: 'ORG-003',
    name: 'Retail Pro',
    businessType: 'Retail Store',
    status: 'suspended',
    createdAt: new Date('2024-02-01'),
    subscription: {
      id: 'SUB-003',
      status: 'suspended',
      startDate: new Date('2024-02-01'),
      currentPeriodStart: new Date('2024-02-01'),
      currentPeriodEnd: new Date('2024-03-01'),
      nextBillingDate: new Date('2024-03-01'),
      plan: {
        id: 'plan-1',
        name: 'Starter',
      },
      creditBalance: {
        id: 'CRED-003',
        totalCredits: 1000,
        usedCredits: 300,
        remainingCredits: 700,
      },
    },
  },
  {
    id: 'ORG-004',
    name: 'Food Delight',
    businessType: 'Restaurant',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    subscription: {
      id: 'SUB-004',
      status: 'active',
      startDate: new Date('2024-01-10'),
      currentPeriodStart: new Date('2024-02-01'),
      currentPeriodEnd: new Date('2024-03-01'),
      nextBillingDate: new Date('2024-03-01'),
      plan: {
        id: 'plan-2',
        name: 'Professional',
      },
      creditBalance: {
        id: 'CRED-004',
        totalCredits: 5000,
        usedCredits: 4200,
        remainingCredits: 800,
      },
    },
  },
  {
    id: 'ORG-005',
    name: 'Global Imports',
    businessType: 'Import/Export',
    status: 'cancelled',
    createdAt: new Date('2024-01-05'),
    subscription: {
      id: 'SUB-005',
      status: 'cancelled',
      startDate: new Date('2024-01-05'),
      currentPeriodStart: new Date('2024-02-01'),
      currentPeriodEnd: new Date('2024-03-01'),
      nextBillingDate: new Date('2024-03-01'),
      plan: {
        id: 'plan-3',
        name: 'Enterprise',
      },
      creditBalance: {
        id: 'CRED-005',
        totalCredits: 20000,
        usedCredits: 15000,
        remainingCredits: 5000,
      },
    },
  },
  {
    id: 'ORG-006',
    name: 'Fashion Hub',
    businessType: 'Clothing Retail',
    status: 'active',
    createdAt: new Date('2024-02-10'),
    subscription: {
      id: 'SUB-006',
      status: 'active',
      startDate: new Date('2024-02-10'),
      currentPeriodStart: new Date('2024-02-10'),
      currentPeriodEnd: new Date('2024-03-10'),
      nextBillingDate: new Date('2024-03-10'),
      plan: {
        id: 'plan-4',
        name: 'Custom',
      },
      creditBalance: {
        id: 'CRED-006',
        totalCredits: 15000,
        usedCredits: 3200,
        remainingCredits: 11800,
      },
    },
  },
];

const OrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>(mockOrganizations);
  const [statistics] = useState<Statistics>(mockStatistics);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'cancel' | 'reactivate' | 'suspend-subscription' | 'cancel-subscription' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && dropdownRefs.current[openDropdownId] && 
          !dropdownRefs.current[openDropdownId]?.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  // Filter organizations when search term changes
  useEffect(() => {
    if (!debouncedSearchTerm) {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.filter(org =>
        org.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        org.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    }
    setCurrentPage(1);
  }, [debouncedSearchTerm, organizations]);

  const handleAction = (org: Organization, type: 'suspend' | 'cancel' | 'reactivate' | 'suspend-subscription' | 'cancel-subscription') => {
    setSelectedOrganization(org);
    setActionType(type);
    setShowActionModal(true);
    setOpenDropdownId(null); // Close dropdown when action is selected
  };

  const toggleDropdown = (orgId: string) => {
    setOpenDropdownId(openDropdownId === orgId ? null : orgId);
  };

  const confirmAction = async () => {
    if (!selectedOrganization || !actionType) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    let updatedOrg = { ...selectedOrganization };

    switch (actionType) {
      case 'suspend':
        updatedOrg.status = 'suspended';
        break;
      case 'cancel':
        updatedOrg.status = 'cancelled';
        break;
      case 'reactivate':
        updatedOrg.status = 'active';
        break;
      case 'suspend-subscription':
        updatedOrg.subscription.status = 'suspended';
        break;
      case 'cancel-subscription':
        updatedOrg.subscription.status = 'cancelled';
        break;
    }

    setOrganizations(prev =>
      prev.map(org => org.id === selectedOrganization.id ? updatedOrg : org)
    );

    setIsLoading(false);
    setShowActionModal(false);
    setSelectedOrganization(null);
    setActionType(null);
  };

  const getStatusColor = (status: string) => {
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

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
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
    return (org.subscription.creditBalance.usedCredits / org.subscription.creditBalance.totalCredits) * 100;
  };

  // Statistics Cards (same as before)
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
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Action Dropdown Component
  const ActionDropdown: React.FC<{ org: Organization }> = ({ org }) => {
    const isOpen = openDropdownId === org.id;

    return (
      <div 
        className="relative"
        ref={el => dropdownRefs.current[org.id] = el as any}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleDropdown(org.id)}
          className="min-w-[40px] md:min-w-[80px]"
        >
          <FiMoreVertical className="md:mr-1" />
          <span className="hidden md:inline">Actions</span>
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-10">
            <div className="py-1">
              {/* Organization Status Actions */}
              <div className="px-3 py-2 text-xs font-medium text-neutral-500 border-b border-neutral-200">
                Organization
              </div>
              
              {org.status === 'active' ? (
                <button
                  onClick={() => handleAction(org, 'suspend')}
                  className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <FiPause className="mr-2 text-yellow-600" />
                  Suspend Organization
                </button>
              ) : (
                <button
                  onClick={() => handleAction(org, 'reactivate')}
                  className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <FiPlay className="mr-2 text-green-600" />
                  Reactivate Organization
                </button>
              )}

              {/* Subscription Actions */}
              <div className="px-3 py-2 text-xs font-medium text-neutral-500 border-b border-neutral-200 mt-1">
                Subscription
              </div>
              
              {org.subscription.status === 'active' && (
                <button
                  onClick={() => handleAction(org, 'suspend-subscription')}
                  className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <FiPause className="mr-2 text-yellow-600" />
                  Suspend Subscription
                </button>
              )}
              
              {org.subscription.status === 'suspended' && (
                <button
                  onClick={() => handleAction(org, 'cancel-subscription')}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FiXCircle className="mr-2" />
                  Cancel Subscription
                </button>
              )}

              {/* Cancel Organization (Danger Action) */}
              <div className="border-t border-neutral-200 mt-1">
                <button
                  onClick={() => handleAction(org, 'cancel')}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 mt-1"
                >
                  <FiXCircle className="mr-2" />
                  Cancel Organization
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Organization Row Component with Dropdown
  const OrganizationRow: React.FC<{ org: Organization }> = ({ org }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border-b border-neutral-200 hover:bg-neutral-50">
      {/* Organization Info - 4 columns */}
      <div className="md:col-span-4 flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <FiUsers className="text-primary-600 text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-neutral-900 truncate">{org.name}</h4>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(org.status)}`}>
              {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-neutral-500 truncate">{org.businessType}</p>
          <p className="text-xs text-neutral-400">ID: {org.id}</p>
        </div>
      </div>

      {/* Subscription Details - 3 columns */}
      <div className="md:col-span-3 hidden md:block">
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Plan:</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPlanColor(org.subscription.plan.name)}`}>
              {org.subscription.plan.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Subscription:</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(org.subscription.status)}`}>
              {org.subscription.status.charAt(0).toUpperCase() + org.subscription.status.slice(1)}
            </span>
          </div>
          <div className="text-neutral-500">
            Next billing: {formatDate(org.subscription.nextBillingDate)}
          </div>
        </div>
      </div>

      {/* Credit Usage - 3 columns */}
      <div className="md:col-span-3 hidden md:block">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Credits:</span>
            <span className="font-medium">
              {formatCurrency(org.subscription.creditBalance.remainingCredits)} / {formatCurrency(org.subscription.creditBalance.totalCredits)}
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCreditUsagePercentage(org)}%` }}
            ></div>
          </div>
          <div className="text-xs text-neutral-500 text-right">
            {getCreditUsagePercentage(org).toFixed(1)}% used
          </div>
        </div>
      </div>

      {/* Actions - 2 columns */}
      <div className="md:col-span-2 flex justify-end">
        <ActionDropdown org={org} />
      </div>

      {/* Mobile details */}
      <div className="md:hidden col-span-1 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-500">Plan</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPlanColor(org.subscription.plan.name)}`}>
              {org.subscription.plan.name}
            </span>
          </div>
          <div>
            <p className="text-neutral-500">Subscription</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(org.subscription.status)}`}>
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

        <div className="flex justify-end">
          <ActionDropdown org={org} />
        </div>
      </div>
    </div>
  );

  // Pagination (same as before)
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);
  const currentOrganizations = filteredOrganizations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 p-4 md:p-0">
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
          value={statistics.organizations.total}
          icon={<FiUsers className="text-blue-600 text-xl" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Active Organizations"
          value={statistics.organizations.status.active}
          icon={<FiCheckCircle className="text-green-600 text-xl" />}
          color="bg-green-50"
        />
        <StatCard
          title="Suspended"
          value={statistics.organizations.status.suspended}
          icon={<FiPause className="text-yellow-600 text-xl" />}
          color="bg-yellow-50"
        />
        <StatCard
          title="Cancelled"
          value={statistics.organizations.status.cancelled}
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
                {((count / statistics.organizations.total) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Organizations List */}
      <div className="bg-white rounded-lg shadow-medium">
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
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Organizations List */}
        <div className="overflow-hidden">
          {/* Header Row - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-sm font-medium text-neutral-700">
            <div className="col-span-4">Organization</div>
            <div className="col-span-3">Subscription Details</div>
            <div className="col-span-3">Credit Usage</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Organizations Items */}
          {currentOrganizations.length === 0 ? (
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
            <div className="divide-y divide-neutral-200">
              {currentOrganizations.map((org) => (
                <OrganizationRow key={org.id} org={org} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0">
              <div className="text-sm text-neutral-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredOrganizations.length)} of {filteredOrganizations.length} organizations
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
                          pageNum === currentPage ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
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
        </div>
      </div>

      {/* Action Confirmation Modal (same as before) */}
      {showActionModal && selectedOrganization && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">
                {actionType === 'suspend' && 'Suspend Organization'}
                {actionType === 'cancel' && 'Cancel Organization'}
                {actionType === 'reactivate' && 'Reactivate Organization'}
                {actionType === 'suspend-subscription' && 'Suspend Subscription'}
                {actionType === 'cancel-subscription' && 'Cancel Subscription'}
              </h3>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedOrganization(null);
                  setActionType(null);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <FiAlertCircle className="text-yellow-600 mr-3 text-xl" />
                <div>
                  <h4 className="font-medium text-neutral-900">Confirm Action</h4>
                  <p className="text-sm text-neutral-600 mt-1">
                    {actionType === 'suspend' && `Are you sure you want to suspend ${selectedOrganization.name}? They will lose access to the platform.`}
                    {actionType === 'cancel' && `Are you sure you want to cancel ${selectedOrganization.name}? This action cannot be undone.`}
                    {actionType === 'reactivate' && `Are you sure you want to reactivate ${selectedOrganization.name}? They will regain access to the platform.`}
                    {actionType === 'suspend-subscription' && `Are you sure you want to suspend ${selectedOrganization.name}'s subscription? They will lose access to premium features.`}
                    {actionType === 'cancel-subscription' && `Are you sure you want to cancel ${selectedOrganization.name}'s subscription? This action cannot be undone.`}
                  </p>
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
                >
                  {isLoading ? (
                    <>
                      <FiRefreshCw className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === 'suspend' && 'Suspend Organization'}
                      {actionType === 'cancel' && 'Cancel Organization'}
                      {actionType === 'reactivate' && 'Reactivate Organization'}
                      {actionType === 'suspend-subscription' && 'Suspend Subscription'}
                      {actionType === 'cancel-subscription' && 'Cancel Subscription'}
                    </>
                  )}
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