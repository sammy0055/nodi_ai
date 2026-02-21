import React, { useEffect, useState } from 'react';
import {
  FiCheck,
  FiX,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiUser,
  FiCalendar,
  FiTag,
  FiChevronRight,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useAdminUserValue, useRequestSetRecoilState, useRequestValue } from '../../store/admin/authAtoms';
import { AdminUserService } from '../../services/admin/AdminUserService';
import type { BaseRequestAttributes, IWhatsAppDetails } from '../../types/request';
import { useLoaderData } from 'react-router';
import WhatsAppDetailsModal from '../../components/organisms/WhatsAppDetailsModal/WhatsAppDetailsModal';
import type { Pagination } from '../../types/customer';

// Define types based on your interface
const RequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Mock data - replace with actual data from your API
const existingWhatsAppDetails: IWhatsAppDetails = {
  id: 'whatsapp-001',
  whatsappBusinessId: '1234567890',
  organizationId: 'org-001',
  organizationName: 'mike tent',
  catalogId: 'catalog_12345',
};

export const mockRequests: BaseRequestAttributes[] = [
  {
    id: 'req-001',
    organizationId: 'org-1',
    requesterUserId: 'user-1',
    title: 'Add New Catalog',
    description: 'Request to create a new product catalog.',
    status: 'pending',
    requestType: 'CatalogRequest',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-100',
      organizationId: 'org-1',
      organizationName: 'BlueMart',
    },
  },
  {
    id: 'req-002',
    organizationId: 'org-2',
    requesterUserId: 'user-6',
    title: 'New Product Listing',
    description: 'Add new summer collection items.',
    status: 'approved',
    requestType: 'ProductRequest',
    approvedByUserId: 'admin-1',
    approvalNotes: 'Looks good.',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-200',
      organizationId: 'org-2',
      organizationName: 'UrbanStyle',
    },
  },
  {
    id: 'req-003',
    organizationId: 'org-3',
    requesterUserId: 'user-4',
    title: 'Bulk Order Update',
    description: 'Modify order quantities.',
    status: 'rejected',
    requestType: 'OrderRequest',
    rejectedAt: new Date(),
    approvalNotes: 'Incorrect order details.',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-300',
      organizationId: 'org-3',
      organizationName: 'PrimeWholesale',
    },
  },
  {
    id: 'req-004',
    organizationId: 'org-1',
    requesterUserId: 'user-2',
    title: 'Update Catalog Description',
    description: 'Revamp product descriptions.',
    status: 'pending',
    requestType: 'CatalogRequest',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-100',
      organizationId: 'org-1',
      organizationName: 'BlueMart',
    },
  },
  {
    id: 'req-005',
    organizationId: 'org-4',
    requesterUserId: 'user-10',
    title: 'Add New Product Variant',
    description: 'Request to add color variants.',
    status: 'approved',
    requestType: 'ProductRequest',
    approvedByUserId: 'admin-2',
    approvalNotes: 'Approved for launch.',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-400',
      organizationId: 'org-4',
      organizationName: 'FashionHub',
    },
  },
  {
    id: 'req-006',
    organizationId: 'org-2',
    requesterUserId: 'user-3',
    title: 'Cancel Order',
    description: 'Customer requested cancellation.',
    status: 'pending',
    requestType: 'OrderRequest',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-200',
      organizationId: 'org-2',
      organizationName: 'UrbanStyle',
    },
  },
  {
    id: 'req-007',
    organizationId: 'org-5',
    requesterUserId: 'user-8',
    title: 'New Product Category',
    description: 'Create electronics category.',
    status: 'approved',
    requestType: 'CatalogRequest',
    approvedByUserId: 'admin-3',
    approvalNotes: 'Category added.',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-500',
      organizationId: 'org-5',
      organizationName: 'TechVille',
    },
  },
  {
    id: 'req-008',
    organizationId: 'org-3',
    requesterUserId: 'user-1',
    title: 'Update Order Address',
    description: 'Fix wrong delivery address.',
    status: 'rejected',
    requestType: 'OrderRequest',
    rejectedAt: new Date(),
    approvalNotes: 'Customer provided invalid address.',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-300',
      organizationId: 'org-3',
      organizationName: 'PrimeWholesale',
    },
  },
  {
    id: 'req-009',
    organizationId: 'org-6',
    requesterUserId: 'user-9',
    title: 'Add Seasonal Catalog',
    description: 'Christmas edition catalog.',
    status: 'pending',
    requestType: 'CatalogRequest',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-600',
      organizationId: 'org-6',
      organizationName: 'HolidayStore',
    },
  },
  {
    id: 'req-010',
    organizationId: 'org-5',
    requesterUserId: 'user-7',
    title: 'Add Mobile Phones',
    description: 'Request to add new mobile phone models.',
    status: 'approved',
    requestType: 'ProductRequest',
    approvedByUserId: 'admin-1',
    approvalNotes: 'Approved for listing.',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-500',
      organizationId: 'org-5',
      organizationName: 'TechVille',
    },
  },
  {
    id: 'req-011',
    organizationId: 'org-4',
    requesterUserId: 'user-6',
    title: 'Refund Request',
    description: 'Customer asking for refund.',
    status: 'pending',
    requestType: 'OrderRequest',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-400',
      organizationId: 'org-4',
      organizationName: 'FashionHub',
    },
  },
  {
    id: 'req-012',
    organizationId: 'org-7',
    requesterUserId: 'user-2',
    title: 'New Product Type',
    description: 'Add home appliances category.',
    status: 'rejected',
    requestType: 'CatalogRequest',
    rejectedAt: new Date(),
    approvalNotes: 'Category not needed now.',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-700',
      organizationId: 'org-7',
      organizationName: 'HomeEase',
    },
  },
  {
    id: 'req-013',
    organizationId: 'org-6',
    requesterUserId: 'user-4',
    title: 'Product Restock',
    description: 'Restock winter jackets.',
    status: 'approved',
    requestType: 'ProductRequest',
    approvedByUserId: 'admin-3',
    approvalNotes: 'Restock confirmed.',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-600',
      organizationId: 'org-6',
      organizationName: 'HolidayStore',
    },
  },
  {
    id: 'req-014',
    organizationId: 'org-3',
    requesterUserId: 'user-5',
    title: 'Fix Wrong Order',
    description: 'Incorrect item shipped.',
    status: 'pending',
    requestType: 'OrderRequest',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-300',
      organizationId: 'org-3',
      organizationName: 'PrimeWholesale',
    },
  },
  {
    id: 'req-015',
    organizationId: 'org-8',
    requesterUserId: 'user-9',
    title: 'Add Beauty Products',
    description: 'Add skincare products.',
    status: 'approved',
    requestType: 'ProductRequest',
    approvedByUserId: 'admin-5',
    approvalNotes: 'Approved.',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-800',
      organizationId: 'org-8',
      organizationName: 'GlowStore',
    },
  },
  {
    id: 'req-016',
    organizationId: 'org-9',
    requesterUserId: 'user-11',
    title: 'Create New Catalog',
    description: 'Sports equipment catalog.',
    status: 'pending',
    requestType: 'CatalogRequest',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-900',
      organizationId: 'org-9',
      organizationName: 'SportsMax',
    },
  },
  {
    id: 'req-017',
    organizationId: 'org-8',
    requesterUserId: 'user-12',
    title: 'Cancel Order',
    description: 'Customer no longer needs order.',
    status: 'rejected',
    requestType: 'OrderRequest',
    rejectedAt: new Date(),
    approvalNotes: 'Already processed.',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-800',
      organizationId: 'org-8',
      organizationName: 'GlowStore',
    },
  },
  {
    id: 'req-018',
    organizationId: 'org-1',
    requesterUserId: 'user-13',
    title: 'Add Product Images',
    description: 'Upload new product photos.',
    status: 'approved',
    requestType: 'ProductRequest',
    approvedByUserId: 'admin-1',
    approvalNotes: 'Images accepted.',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-100',
      organizationId: 'org-1',
      organizationName: 'BlueMart',
    },
  },
  {
    id: 'req-019',
    organizationId: 'org-10',
    requesterUserId: 'user-14',
    title: 'Create Furniture Catalog',
    description: 'Indoor furniture catalog.',
    status: 'pending',
    requestType: 'CatalogRequest',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-1000',
      organizationId: 'org-10',
      organizationName: 'FurniFlex',
    },
  },
  {
    id: 'req-020',
    organizationId: 'org-7',
    requesterUserId: 'user-3',
    title: 'Fix Order Pricing',
    description: 'Wrong amount calculated.',
    status: 'approved',
    requestType: 'OrderRequest',
    approvedByUserId: 'admin-2',
    approvalNotes: 'Corrected price.',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      whatsappBusinessId: 'waba-700',
      organizationId: 'org-7',
      organizationName: 'HomeEase',
    },
  },
];

const RequestRoutePage: React.FC = () => {
  const adminUser = useAdminUserValue();
  const requests = useRequestValue();
  const setRequests = useRequestSetRecoilState();
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<any | 'all'>('all');
  // const [searchTerm, setSearchTerm] = useState('');
  const [whatsappDetails, setWhatsappDetails] = useState<IWhatsAppDetails>(existingWhatsAppDetails);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [pagination, setPagination] = useState<Pagination>();
  const data = useLoaderData() as { requests: { data: BaseRequestAttributes[]; pagination: Pagination } };
  const { approveRequest, rejectRequest, updateOrganizationWABA, getRequests } = new AdminUserService();

  useEffect(() => {
    if (!data.requests) return;
    setRequests(data.requests.data);
  }, [data.requests]);

  const fetchRquests = async (page: number, resetData: boolean = false) => {
    // Build filters for API call
    const filters: any = { page };

    if (filterStatus !== 'all') {
      filters.status = filterStatus;
    }

    try {
      const { data: responseData } = await getRequests({ ...filters });

      if (resetData) {
        // Replace responseData when filters change or first page
        setRequests(responseData.data);
      } else {
        // Append responseData when loading more pages
        setRequests((prev) => [...prev, ...responseData.data]);
      }

      setPagination(responseData.pagination);
    } catch (error: any) {
      alert('Something went wrong, try again later');
    }
  };

  // Handle pagination
  const handlePagination = async (page: number) => {
    await fetchRquests(page, page === 1);
  };

  // Reset to first page and refetch when filters change
  useEffect(() => {
    handlePagination(1);
  }, [filterStatus]);

  const handleApprove = async (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    setWhatsappDetails({ ...req?.data!, catalogId: '', id: req?.id });
    setIsWhatsAppModalOpen(true);
  };

  const handleSaveWhatsAppDetails = async (details: IWhatsAppDetails) => {
    try {
      const aprovedData: any = {
        id: details.id,
        status: 'approved',
        approvedAt: new Date(),
        approvedByUserId: adminUser?.id!,
        approvalNotes: 'Request approved',
      };

      await updateOrganizationWABA(details);
      await approveRequest(aprovedData);

      setRequests((prevState) => {
        const updatedRequest = prevState.map((req) => {
          return req.id === details.id
            ? {
                ...req,
                ...aprovedData,
              }
            : req;
        });
        return updatedRequest;
      });
      setIsWhatsAppModalOpen(false);
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const rejectionDAta = {
        id: requestId,
        status: 'rejected' as 'rejected',
        approvedAt: new Date(),
        approvedByUserId: adminUser?.id!,
        approvalNotes: 'Request approved',
      };
      await rejectRequest(rejectionDAta);
      setRequests((prevState) => {
        const updatedRequest = prevState.map((req) => {
          return req.id === requestId
            ? {
                ...req,
                status: 'rejected' as 'rejected',
                approvedAt: new Date(),
                approvedByUserId: adminUser?.id!,
                approvalNotes: 'Request approved',
              }
            : req;
        });
        return updatedRequest;
      });
    } catch (error: any) {
      alert('something went wrong');
    }
  };

  const toggleExpand = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case RequestStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case RequestStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case RequestStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case RequestStatus.PENDING:
        return <FiClock className="mr-1" />;
      case RequestStatus.APPROVED:
        return <FiCheck className="mr-1" />;
      case RequestStatus.REJECTED:
        return <FiX className="mr-1" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateMobile = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header - Stack on mobile */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900">Request Management</h2>

        {/* Search and Filter - Stack vertically on mobile */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-neutral-500 hidden sm:block" />
            <select
              className="w-full sm:w-auto border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value={RequestStatus.PENDING}>Pending</option>
              <option value={RequestStatus.APPROVED}>Approved</option>
              <option value={RequestStatus.REJECTED}>Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No requests found matching your criteria.</div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {requests.map((request) => (
              <div key={request.id} className="p-4 md:p-6">
                {/* Mobile Layout - Stacked */}
                <div className="md:hidden space-y-3">
                  {/* Header Row */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-neutral-900 truncate">{request.title}</h3>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          {request?.status?.charAt(0).toUpperCase() + request?.status!.slice(1)}
                        </span>
                        <span className="ml-2 text-xs text-neutral-500">
                          <FiTag className="inline mr-1" size={12} />
                          {request.requestType}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(request.id!)}
                      className="shrink-0 ml-2"
                    >
                      {expandedRequest === request.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </Button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 line-clamp-2">{request.description}</p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center">
                      <FiCalendar className="mr-1" size={12} />
                      {formatDateMobile(request.createdAt!)}
                    </div>
                    <div className="flex items-center">
                      <FiUser className="mr-1" size={12} />
                      {request.requesterUserId}
                    </div>
                  </div>

                  {/* Action Buttons - Full width on mobile */}
                  {request.status === RequestStatus.PENDING && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(request.id!)}
                        className="flex-1 text-error hover:bg-error-50 text-xs"
                      >
                        <FiX className="mr-1" size={12} />
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(request.id!)} className="flex-1 text-xs">
                        <FiCheck className="mr-1" size={12} />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900">{request.title}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        {request.status!.charAt(0).toUpperCase() + request.status!.slice(1)}
                      </span>
                    </div>
                    <p className="text-neutral-600 mb-4">{request.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-neutral-500">
                      <span className="flex items-center">
                        <FiTag className="mr-1" />
                        Type: {request.requestType}
                      </span>
                      <span className="flex items-center">
                        <FiCalendar className="mr-1" />
                        Created: {formatDate(request.createdAt!)}
                      </span>
                      {request.approvedAt && (
                        <span className="flex items-center">
                          <FiCheck className="mr-1" />
                          Approved: {formatDate(request.approvedAt)}
                        </span>
                      )}
                      {request.rejectedAt && (
                        <span className="flex items-center">
                          <FiX className="mr-1" />
                          Rejected: {formatDate(request.rejectedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {request.status === RequestStatus.PENDING && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(request.id!)}
                          className="text-error hover:bg-error-50"
                        >
                          <FiX className="mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(request.id!)}>
                          <FiCheck className="mr-1" />
                          Approve
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" onClick={() => toggleExpand(request.id!)}>
                      {expandedRequest === request.id ? (
                        <FiChevronUp className="mr-1" />
                      ) : (
                        <FiChevronDown className="mr-1" />
                      )}
                      Details
                    </Button>
                  </div>
                </div>

                {/* Expanded Details - Responsive */}
                {expandedRequest === request.id && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <h4 className="font-medium text-neutral-800 mb-3 text-sm md:text-base">Request Details</h4>

                    {/* Data Field Values */}
                    <div className="bg-neutral-50 rounded-lg p-3 md:p-4 mb-4">
                      <pre className="text-xs md:text-sm text-neutral-700 overflow-x-auto">
                        {JSON.stringify(request.data, null, 2)}
                      </pre>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <h5 className="font-medium text-neutral-700 mb-2 text-sm md:text-base">Approval Information</h5>
                        <div className="space-y-1 text-xs md:text-sm">
                          <p className="flex items-center">
                            <span className="text-neutral-500 w-24 md:w-32">Approved By:</span>
                            {request.approvedByUserId || 'N/A'}
                          </p>
                          <p className="flex items-start">
                            <span className="text-neutral-500 w-24 md:w-32 shrink-0">Approval Notes:</span>
                            <span className="flex-1">{request.approvalNotes || 'N/A'}</span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-neutral-700 mb-2 text-sm md:text-base">Timestamps</h5>
                        <div className="space-y-1 text-xs md:text-sm">
                          <p className="flex items-center">
                            <span className="text-neutral-500 w-24 md:w-32">Created:</span>
                            {formatDate(request?.createdAt!)}
                          </p>
                          <p className="flex items-center">
                            <span className="text-neutral-500 w-24 md:w-32">Updated:</span>
                            {formatDate(request?.updatedAt!)}
                          </p>
                          {request?.approvedAt && (
                            <p className="flex items-center">
                              <span className="text-neutral-500 w-24 md:w-32">Approved:</span>
                              {formatDate(request?.approvedAt)}
                            </p>
                          )}
                          {request?.rejectedAt && (
                            <p className="flex items-center">
                              <span className="text-neutral-500 w-24 md:w-32">Rejected:</span>
                              {formatDate(request?.rejectedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination - Using OrganizationsPage style */}
      {pagination && pagination?.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0">
          <div className="text-sm text-neutral-500">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems}{' '}
            notifications
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePagination(pagination.currentPage + 1)}
            >
              load more
              <FiChevronRight className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      <div>
        {/* WhatsApp Details Modal */}
        <WhatsAppDetailsModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          onSave={async (details) => await handleSaveWhatsAppDetails(details)}
          initialData={whatsappDetails}
        />
      </div>
    </div>
  );
};

export default RequestRoutePage;
