import React, { useEffect, useState } from 'react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiPhone,
  FiMail,
  FiTruck,
  FiPackage,
  FiSave,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import type { IBranch } from '../../types/branch';
import { BranchService } from '../../services/branchService';
import { useBranchSetRecoilState, useBranchValue } from '../../store/authAtoms';
import { useDebounce } from 'use-debounce';
import { useLoaderData } from 'react-router';
import type { Pagination } from '../../types/customer';

// Validation interface
interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  deliveryTime?: string;
  takeAwayTime?: string;
}

const BranchesPage: React.FC = () => {
  const data = useLoaderData() as {
    branches: { data: IBranch[]; pagination: Pagination };
  };
  const branches = useBranchValue();
  const setBranches = useBranchSetRecoilState();
  const [pagination, setPagination] = useState<Pagination>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<IBranch | null>(null);
  const [newBranch, setNewBranch] = useState<Partial<IBranch>>({
    isActive: true,
    supportsDelivery: false,
    supportsTakeAway: false,
    // deliveryTime: new Date(),
    // takeAwayTime: new Date(),
  });

  // set branche data on page load
  useEffect(() => {
    if (data) {
      setBranches(data.branches.data);
      setPagination(data.branches.pagination);
    }
  }, [data]);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [deliveryTimeUnit, setDeliveryTimeUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [takeAwayTimeUnit, setTakeAwayTimeUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const { createBranch, updateBranch, deleteBranch, getBranches } = new BranchService();
  // Helper functions to convert between Date and time units
  const getTimeValue = (
    date: Date | string | number | undefined,
    unit: 'minutes' | 'hours' | 'days'
  ): number | null => {
    if (!date) return null;
    // normalize to Date
    const d = date instanceof Date ? date : new Date(date); // handles string or number

    if (isNaN(d.getTime())) return null; // invalid date fallback

    const totalMinutes = Math.floor(d.getTime() / (1000 * 60));

    switch (unit) {
      case 'minutes':
        return totalMinutes;
      case 'hours':
        return Math.floor(totalMinutes / 60);
      case 'days':
        return Math.floor(totalMinutes / 1440); // 1440 minutes in a day
      default:
        return totalMinutes;
    }
  };

  const setTimeValue = (value: number, unit: 'minutes' | 'hours' | 'days'): Date => {
    let totalMinutes = 0;

    switch (unit) {
      case 'minutes':
        totalMinutes = value;
        break;
      case 'hours':
        totalMinutes = value * 60;
        break;
      case 'days':
        totalMinutes = value * 1440; // 24 hours * 60 minutes
        break;
      default:
        totalMinutes = value;
    }

    // Return a Date object representing the time duration in milliseconds
    return new Date(totalMinutes * 60 * 1000);
  };

  // Validation functions
  const validateField = (name: keyof ValidationErrors, value: any): string | undefined => {
    switch (name) {
      case 'name':
        if (!value || value.trim().length === 0) return 'Branch name is required';
        if (value.trim().length < 2) return 'Branch name must be at least 2 characters';
        if (value.trim().length > 100) return 'Branch name must be less than 100 characters';
        break;

      case 'phone':
        if (!value || value.trim().length === 0) return 'Phone number is required';
        if (!/^\+?[\d\s\-()]+$/.test(value)) return 'Please enter a valid phone number';
        if (value.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits';
        break;

      case 'email':
        if (!value || value.trim().length === 0) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        break;

      case 'location':
        if (!value || value.trim().length === 0) return 'Location is required';
        if (value.trim().length < 5) return 'Location must be at least 5 characters';
        break;

      case 'deliveryTime':
        if (newBranch.supportsDelivery) {
          const d = newBranch.deliveryTime
            ? new Date(newBranch.deliveryTime) // handles Date | string | number
            : null;

          const totalMinutes = d && !isNaN(d.getTime()) ? Math.floor(d.getTime() / (1000 * 60)) : 0;

          if (totalMinutes <= 0) {
            return 'Delivery time must be greater than 0';
          }
          if (totalMinutes > 43200) {
            // 30 days in minutes
            return 'Delivery time cannot exceed 30 days';
          }
        }
        break;

      case 'takeAwayTime':
        if (newBranch.supportsTakeAway) {
          const d = newBranch.takeAwayTime ? new Date(newBranch.takeAwayTime) : null;

          const totalMinutes = d && !isNaN(d.getTime()) ? Math.floor(d.getTime() / (1000 * 60)) : 0;

          if (totalMinutes <= 0) {
            return 'Take away time must be greater than 0';
          }
          if (totalMinutes > 43200) {
            // 30 days in minutes
            return 'Take away time cannot exceed 30 days';
          }
        }
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate required fields
    errors.name = validateField('name', newBranch.name);
    errors.phone = validateField('phone', newBranch.phone);
    errors.email = validateField('email', newBranch.email);
    errors.location = validateField('location', newBranch.location);

    // Validate conditional fields
    if (newBranch.supportsDelivery) {
      errors.deliveryTime = validateField('deliveryTime', newBranch.deliveryTime);
    }

    if (newBranch.supportsTakeAway) {
      errors.takeAwayTime = validateField('takeAwayTime', newBranch.takeAwayTime);
    }

    setValidationErrors(errors);

    // Check if there are any errors
    return !Object.values(errors).some((error) => error !== undefined);
  };

  // Format time for display
  const formatTime = (date: Date | string | number | undefined): string => {
    if (!date) return '0 min';

    // normalize to Date
    const d = date instanceof Date ? date : new Date(date); // handles string or number

    if (isNaN(d.getTime())) return 'Invalid date';

    const totalMinutes = Math.floor(d.getTime() / (1000 * 60));

    if (totalMinutes >= 1440) {
      // 1440 minutes = 1 day
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;

      if (hours === 0 && minutes === 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
      } else if (days === 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${days}d ${hours}h ${minutes}m`;
      }
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours === 0) {
        return `${minutes} min`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
  };

  // CRUD Operations with validation
  const handleCreateBranch = async () => {
    try {
      if (!validateForm()) {
        return; // Stop if validation fails
      }

      const branchToCreate: IBranch = {
        id: `branch-${Date.now()}`,
        name: newBranch.name || '',
        ...(newBranch.code && {
          code: newBranch.code,
        }),
        phone: newBranch.phone || '',
        email: newBranch.email || '',
        isActive: newBranch.isActive ?? true,
        location: newBranch.location || '',
        supportsDelivery: newBranch.supportsDelivery ?? false,
        supportsTakeAway: newBranch.supportsTakeAway ?? false,
        ...(newBranch.supportsDelivery && {
          deliveryTime: newBranch.deliveryTime,
        }),
        ...(newBranch.supportsTakeAway && {
          takeAwayTime: newBranch.takeAwayTime,
        }),
      };
      const { data } = await createBranch(branchToCreate);
      setBranches([...branches, data]);
      setShowBranchModal(false);
      resetForm();
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleUpdateBranch = async () => {
    try {
      if (!editingBranch || !validateForm()) {
        return; // Stop if no branch selected or validation fails
      }
      const { data } = await updateBranch(newBranch as IBranch);
      setBranches(branches.map((branch) => (branch.id === editingBranch.id ? { ...(data as IBranch) } : branch)));
      setShowBranchModal(false);
      setEditingBranch(null);
      resetForm();
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleEditBranch = (branch: IBranch) => {
    setEditingBranch(branch);
    setNewBranch(branch);
    setValidationErrors({});
    setShowBranchModal(true);
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this branch?')) {
        await deleteBranch(branchId);
        setBranches(branches.filter((branch) => branch.id !== branchId));
      }
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleToggleStatus = (branchId: string) => {
    setBranches(
      branches.map((branch) => (branch.id === branchId ? { ...branch, isActive: !branch.isActive } : branch))
    );
  };

  const handleFieldChange = (field: keyof IBranch, value: any) => {
    setNewBranch((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const [debouncedTerm] = useDebounce(searchTerm, 500); // 500ms delay

  useEffect(() => {
    const Fn = async () => {
      const data = await getBranches(1, searchTerm);
      setBranches(data.data.data);
      setPagination(data?.data?.pagination);
    };
    Fn();
  }, [debouncedTerm]);

  const resetForm = () => {
    setNewBranch({
      isActive: true,
      supportsDelivery: false,
      supportsTakeAway: false,
      // deliveryTime: new Date('2023-01-01T30:00:00'),
      // takeAwayTime: new Date('2023-01-01T15:00:00'),
    });
    setEditingBranch(null);
    setValidationErrors({});
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleZonePagination = async (currentPage: number) => {
    try {
      const { data } = await getBranches(currentPage);
      setBranches((prev) => [...prev, ...data.data]);
      setPagination(data.pagination);
    } catch (error: any) {
      alert('something went wrong, try again');
    }
  };

  // Branch Row Component
  const BranchRow: React.FC<{ branch: IBranch }> = ({ branch }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border-b border-neutral-200 hover:bg-neutral-50">
      {/* Branch Info - Mobile first column */}
      <div className="md:col-span-4 flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <FiMapPin className="text-primary-600 text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-neutral-900 truncate">{branch.name}</h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                branch.isActive ?? true
              )}`}
            >
              {branch.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-neutral-500 truncate flex items-center">
            <FiMapPin className="mr-1 text-neutral-400" size={12} />
            {branch.location}
          </p>
          <p className="text-xs text-neutral-400">{branch.code}</p>
        </div>
      </div>

      {/* Contact Info - Hidden on mobile */}
      <div className="md:col-span-3 hidden md:block space-y-1">
        <p className="text-sm text-neutral-600 flex items-center">
          <FiPhone className="mr-2 text-neutral-400" size={14} />
          {branch.phone}
        </p>
        <p className="text-sm text-neutral-600 flex items-center">
          <FiMail className="mr-2 text-neutral-400" size={14} />
          {branch.email}
        </p>
      </div>

      {/* Services - Hidden on mobile */}
      <div className="md:col-span-3 hidden md:block">
        <div className="flex flex-wrap gap-1">
          {branch.supportsDelivery && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              <FiTruck className="mr-1" size={10} />
              Delivery
            </span>
          )}
          {branch.supportsTakeAway && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              <FiPackage className="mr-1" size={10} />
              Take Away
            </span>
          )}
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          {branch.supportsDelivery && `Delivery: ${formatTime(branch.deliveryTime)}`}
          {branch.supportsDelivery && branch.supportsTakeAway && ' • '}
          {branch.supportsTakeAway && `Take Away: ${formatTime(branch.takeAwayTime)}`}
        </div>
      </div>

      {/* Actions */}
      <div className="md:col-span-2 flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => handleEditBranch(branch)}>
          <FiEdit className="mr-1" />
          <span className="hidden md:inline">Edit</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteBranch(branch.id)}
          className="text-error hover:bg-error-50"
        >
          <FiTrash2 className="mr-1" />
          <span className="hidden md:inline">Delete</span>
        </Button>
      </div>

      {/* Mobile details */}
      <div className="md:hidden col-span-1 space-y-2">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span className="flex items-center">
            <FiPhone className="mr-1" size={12} />
            {branch.phone}
          </span>
          <span className="flex items-center">
            <FiMail className="mr-1" size={12} />
            {branch.email}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {branch.supportsDelivery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <FiTruck size={10} />
              </span>
            )}
            {branch.supportsTakeAway && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                <FiPackage size={10} />
              </span>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(branch.id)}>
            {branch.isActive ? 'Deactivate' : 'Activate'}
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
          <h2 className="text-2xl font-bold text-neutral-900">Branches</h2>
          <p className="text-neutral-600 mt-1">Manage your business branches</p>
        </div>

        <Button
          onClick={() => {
            setShowBranchModal(true);
            resetForm();
          }}
        >
          <FiPlus className="mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-medium p-4">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search branches by name, location, phone, or email..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Branches List */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {/* Header Row - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-sm font-medium text-neutral-700">
          <div className="col-span-4">Branch Info</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-3">Services</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Branches */}
        {branches?.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <FiMapPin className="mx-auto text-4xl text-neutral-300 mb-3" />
            <p>No branches found{searchTerm && ` matching "${searchTerm}"`}</p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {branches?.map((branch) => (
              <BranchRow key={branch.id} branch={branch} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination?.totalPages === 0 && pagination?.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0">
            <div className="text-sm text-neutral-500">
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems}{' '}
              branches
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination?.currentPage === 1}
                onClick={() => setPagination((prev) => ({ ...prev!, currentPage: prev!.currentPage - 1 }))}
              >
                <FiChevronLeft className="mr-1" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination?.hasNextPage}
                onClick={() => handleZonePagination(pagination.currentPage + 1)}
              >
                Next
                <FiChevronRight className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h3>
              <button
                onClick={() => {
                  setShowBranchModal(false);
                  resetForm();
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Validation Summary */}
              {Object.values(validationErrors).some((error) => error) && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FiAlertCircle className="text-error-600 mr-3 text-xl" />
                    <div>
                      <h4 className="text-error-800 font-medium">Please fix the following errors:</h4>
                      <ul className="text-error-700 text-sm mt-1 list-disc list-inside">
                        {Object.entries(validationErrors).map(([field, error]) =>
                          error ? <li key={field}>{error}</li> : null
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Branch Name *"
                  value={newBranch.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  error={validationErrors.name}
                  required
                />

                <Input
                  label="Branch Code"
                  value={newBranch.code || ''}
                  onChange={(e) => handleFieldChange('code', e.target.value)}
                  placeholder="e.g., DT-001"
                />

                <Input
                  label="Phone Number *"
                  type="tel"
                  value={newBranch.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  error={validationErrors.phone}
                  required
                />

                <Input
                  label="Email Address *"
                  type="email"
                  value={newBranch.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  error={validationErrors.email}
                  required
                />
              </div>

              <Input
                label="Location *"
                value={newBranch.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                error={validationErrors.location}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Options */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-3 block">Services</label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newBranch.supportsDelivery ?? false}
                        onChange={(e) => handleFieldChange('supportsDelivery', e.target.checked)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-neutral-700">Supports Delivery</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newBranch.supportsTakeAway ?? false}
                        onChange={(e) => handleFieldChange('supportsTakeAway', e.target.checked)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-neutral-700">Supports Take Away</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newBranch.isActive ?? true}
                        onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-neutral-700">Active Branch</span>
                    </label>
                  </div>
                </div>

                {/* Time Settings */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-3 block">Service Times</label>
                  <div className="space-y-4">
                    {newBranch.supportsDelivery && (
                      <div className="flex items-center space-x-3">
                        <FiTruck className="text-neutral-400 flex-shrink-0" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-neutral-700 mb-2 block">Delivery Time</label>
                          <div className="flex space-x-2">
                            <select
                              className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                              value={deliveryTimeUnit}
                              onChange={(e) => setDeliveryTimeUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                            </select>
                            <Input
                              label=""
                              type="number"
                              value={getTimeValue(newBranch.deliveryTime, deliveryTimeUnit) || ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                const newTime = setTimeValue(value, deliveryTimeUnit);
                                handleFieldChange('deliveryTime', newTime);
                              }}
                              error={validationErrors.deliveryTime}
                              size="sm"
                              min="1"
                              max={deliveryTimeUnit === 'days' ? '30' : deliveryTimeUnit === 'hours' ? '720' : '1440'}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {newBranch.supportsTakeAway && (
                      <div className="flex items-center space-x-3">
                        <FiPackage className="text-neutral-400 flex-shrink-0" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-neutral-700 mb-2 block">Take Away Time</label>
                          <div className="flex space-x-2">
                            <select
                              className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                              value={takeAwayTimeUnit}
                              onChange={(e) => setTakeAwayTimeUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                            </select>
                            <Input
                              label=""
                              type="number"
                              value={getTimeValue(newBranch.takeAwayTime, takeAwayTimeUnit) || ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                const newTime = setTimeValue(value, takeAwayTimeUnit);
                                handleFieldChange('takeAwayTime', newTime);
                              }}
                              error={validationErrors.takeAwayTime}
                              size="sm"
                              min="1"
                              max={takeAwayTimeUnit === 'days' ? '30' : takeAwayTimeUnit === 'hours' ? '720' : '1440'}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBranchModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingBranch ? handleUpdateBranch : handleCreateBranch}>
                  <FiSave className="mr-2" />
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesPage;
