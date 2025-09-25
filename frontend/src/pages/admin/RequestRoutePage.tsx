import React, { useState } from 'react';
import {
  FiCheck,
  FiX,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiSearch,
  FiUser,
  FiCalendar,
  FiTag,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useAdminUserValue, useRequestSetRecoilState, useRequestValue } from '../../store/admin/authAtoms';

// Define types based on your interface
// Define types based on your interface
const RequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const RequestRoutePage: React.FC = () => {
  const adminUser = useAdminUserValue();
  const requests = useRequestValue();
  const setRequests = useRequestSetRecoilState();
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<any | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = (requestId: string) => {

    setRequests((prevState) => {
      const updatedRequest = prevState.map((req) => {
        return req.id === requestId
          ? {
              ...req,
              status: 'approved' as 'approved',
              approvedAt: new Date(),
              approvedByUserId: adminUser?.id!,
              approvalNotes: 'Request approved',
            }
          : req;
      });
      return updatedRequest;
    });
  };

  const handleReject = (requestId: string) => {
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
  };

  const toggleExpand = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search requests..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No requests found matching your criteria.</div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredRequests.map((request) => (
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
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
                      onClick={() => toggleExpand(request.id)}
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
                        onClick={() => handleReject(request.id)}
                        className="flex-1 text-error hover:bg-error-50 text-xs"
                      >
                        <FiX className="mr-1" size={12} />
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(request.id)} className="flex-1 text-xs">
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
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
                          onClick={() => handleReject(request.id)}
                          className="text-error hover:bg-error-50"
                        >
                          <FiX className="mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(request.id)}>
                          <FiCheck className="mr-1" />
                          Approve
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" onClick={() => toggleExpand(request.id)}>
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
    </div>
  );
};

export default RequestRoutePage;
