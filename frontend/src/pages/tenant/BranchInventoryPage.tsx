import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiMapPin,
  FiSave,
  FiX,
  FiAlertCircle,
  FiBox,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { useDebounce } from 'use-debounce';
import { ProductService } from '../../services/productService';
import { useBranchInventorySetRecoilState, useBranchInventoryValue, useUserValue } from '../../store/authAtoms';
import { BranchService } from '../../services/branchService';
import type { IBranch, IBranchInventory } from '../../types/branch';
import { BranchInventoryService } from '../../services/branchInventory';
import { CurrencySymbols, type CurrencyCode, type Product } from '../../types/product';
import { useLoaderData, useNavigate } from 'react-router';
import type { Pagination } from '../../types/customer';
import { useClickOutside } from '../../hooks/clickOutside';
import { useValidateUserRolesAndPermissions } from '../../hooks/validateUserRoleAndPermissions';

// Validation interface
interface ValidationErrors {
  branchId?: string;
  productId?: string;
  sellingPrice?: string;
  quantityOnHand?: string;
  quantityReserved?: string;
  costPrice?: string;
}

const BranchInventoryPage: React.FC = () => {
  const data = useLoaderData() as {
    products: { data: Product[]; pagination: Pagination };
    inventory: { data: IBranchInventory[]; pagination: Pagination };
    braches: { data: IBranch[]; pagination: Pagination };
  };

  const user = useUserValue();
  const { isUserPermissionsValid, isUserRoleValid } = useValidateUserRolesAndPermissions(user!);

  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [pageBranches, setPageBranches] = useState<IBranch[]>([]);
  const [selectedPageBranch, setSelectedPageBranch] = useState<string | null>(null);
  const inventory = useBranchInventoryValue();
  const setInventory = useBranchInventorySetRecoilState();
  const [pagination, setPagination] = useState<Pagination>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventory, setEditingInventory] = useState<IBranchInventory | null>(null);
  const [newInventory, setNewInventory] = useState<Partial<IBranchInventory>>({
    isActive: true,
    quantityOnHand: 0,
    quantityReserved: 0,
    costPrice: 0,
    sellingPrice: 0,
    isAllBranchSelected: false,
    isAllProductSelected: false,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Search states for dropdowns
  const [branchSearch, setBranchSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const { createInventory, updateInventory, deleteInventory, searchInventory, getInventories } =
    new BranchInventoryService();

  // load initial states
  useEffect(() => {
    if (data) {
      setProducts(data.products.data);
      setInventory(data.inventory.data);
      setBranches(data.braches.data);
      setPageBranches(data.braches.data);
      setPagination(data.inventory.pagination);
      setBranchPagination(data.braches.pagination);
      setProductPagination(data.products.pagination);
    }
  }, [data]);

  // Pagination
  const [branchPagination, setBranchPagination] = useState<Pagination>();
  const [productPagination, setProductPagination] = useState<Pagination>();
  const ProductDropdownRefs = useRef<HTMLDivElement | null>(null);
  const BranchDropdownRefs = useRef<HTMLDivElement | null>(null);

  // close dropdown on click outside
  useClickOutside(BranchDropdownRefs, () => {
    setShowBranchDropdown(false);
  });

  useClickOutside(ProductDropdownRefs, () => {
    setShowProductDropdown(false);
  });

  const { getBranches } = new BranchService();
  const { getProducts } = new ProductService();

  const loadBranchDropdown = useCallback(async (page: number = 1, search: string = '', append: boolean = false) => {
    try {
      const { data } = await getBranches(page, search);
      if (append) {
        setBranches((prev) => [...prev, ...data.data]);
      } else {
        setBranches(data.data);
      }
      setBranchPagination(data.pagination);
    } catch (error: any) {
      console.error('Error loading organizations:', error);
    }
  }, []);

  const loadProductsDropdown = useCallback(async (page: number = 1, search: string = '', append: boolean = false) => {
    try {
      const { data } = await getProducts(page, search);
      if (append) {
        setProducts((prev) => [...prev, ...data.data]);
      } else {
        setProducts(data.data);
      }
      setProductPagination(data.pagination);
    } catch (error: any) {
      console.error('Error loading organizations:', error);
    }
  }, []);

  // handle branch dropdown search
  const [branchDebouncedTerm] = useDebounce(branchSearch, 500); // 500ms delay
  useEffect(() => {
    if (branchDebouncedTerm !== undefined) {
      loadBranchDropdown(1, branchDebouncedTerm, false);
    }
  }, [branchDebouncedTerm, loadBranchDropdown]);

  // handle products dropdown search
  const [productDebouncedTerm] = useDebounce(productSearch, 500); // 500ms delay
  useEffect(() => {
    if (productDebouncedTerm !== undefined) {
      loadProductsDropdown(1, productDebouncedTerm, false);
    }
  }, [productDebouncedTerm]);

  // handle Branch dropdown LoadDataOnScroll
  const hanldeBrachLoadDataOnScroll = useCallback(() => {
    if (!BranchDropdownRefs.current || !branchPagination?.hasNextPage) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = BranchDropdownRefs.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      const branchPage = branchPagination?.currentPage ? branchPagination?.currentPage + 1 : 1;
      loadBranchDropdown(branchPage, branchSearch, true);
    }
  }, [branchPagination, branchSearch, loadBranchDropdown]);

  // handle Branch dropdown LoadDataOnScroll
  const hanldeProductLoadDataOnScroll = useCallback(() => {
    if (!ProductDropdownRefs.current || !productPagination?.hasNextPage) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = ProductDropdownRefs.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      const productPage = productPagination?.currentPage ? productPagination?.currentPage + 1 : 1;
      loadProductsDropdown(productPage, productSearch, true);
    }
  }, [productPagination]);

  const [inventorySearch] = useDebounce(searchTerm, 500); // 500ms delay

  useEffect(() => {
    const fn = async () => {
      const { data } = await searchInventory({ search: searchTerm, branchId: selectedPageBranch || '' });
      setInventory(data.data); // now filteredProducts is an array
    };

    fn();
  }, [inventorySearch, selectedPageBranch]);

  // Validation functions
  const validateField = (name: keyof ValidationErrors, value: any): string | undefined => {
    switch (name) {
      case 'branchId':
        if (newInventory.isAllBranchSelected) break;
        if (!value) return 'Branch is required';
        break;

      case 'productId':
        if (newInventory.isAllProductSelected) break;
        if (!value) return 'Product is required';
        // Check for duplicate inventory entry
        if (
          !editingInventory &&
          inventory.some((item) => item.branchId === newInventory.branchId && item.productId === value)
        ) {
          return 'Inventory entry for this product already exists in the selected branch';
        }
        break;

      case 'sellingPrice':
        if (!value && value !== 0) return 'Selling price is required';
        if (value < 0) return 'Selling price cannot be negative';
        if (value > 100000000) return 'Selling price is too high';
        break;

      case 'quantityOnHand':
        if (value < 0) return 'Quantity on hand cannot be negative';
        if (value > 100000000) return 'Quantity is too high';
        break;

      case 'quantityReserved':
        if (value < 0) return 'Reserved quantity cannot be negative';
        if (value > (newInventory.quantityOnHand || 0)) {
          return 'Reserved quantity cannot exceed quantity on hand';
        }
        break;

      case 'costPrice':
        if (value && value < 0) return 'Cost price cannot be negative';
        if (value && value > 1000000) return 'Cost price is too high';
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    errors.branchId = validateField('branchId', newInventory.branchId);
    errors.productId = validateField('productId', newInventory.productId);
    errors.sellingPrice = validateField('sellingPrice', newInventory.sellingPrice);
    errors.quantityOnHand = validateField('quantityOnHand', newInventory.quantityOnHand);
    errors.quantityReserved = validateField('quantityReserved', newInventory.quantityReserved);
    errors.costPrice = validateField('costPrice', newInventory.costPrice);

    setValidationErrors(errors);
    return !Object.values(errors).some((error) => error !== undefined);
  };

  // CRUD Operations
  const handleCreateInventory = async () => {
    if (!validateForm()) return;
    try {
      const inventoryToCreate: IBranchInventory = {
        //   id: `inv-${Date.now()}`,
        //   organizationId: 'org-001',
        branchId: newInventory.branchId!,
        productId: newInventory.productId!,
        quantityOnHand: newInventory.quantityOnHand || 0,
        quantityReserved: newInventory.quantityReserved || 0,
        costPrice: newInventory.costPrice,
        sellingPrice: newInventory.sellingPrice || 0,
        isActive: newInventory.isActive ?? true,
        isAllProductSelected: newInventory.isAllProductSelected,
        isAllBranchSelected: newInventory.isAllBranchSelected,
      };
      await createInventory(inventoryToCreate);
      setShowInventoryModal(false);
      resetForm();
      navigate(0);
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleUpdateInventory = async () => {
    if (!isUserRoleValid('super-admin')) {
      if (!isUserPermissionsValid(['inventory.update'])) navigate(-1);
    }
    if (!editingInventory || !validateForm()) return;

    try {
      const { data } = await updateInventory(newInventory as IBranchInventory);
      setInventory(
        inventory.map((item) => (item.id === editingInventory.id ? { ...(data as IBranchInventory) } : item))
      );
      setShowInventoryModal(false);
      setEditingInventory(null);
      resetForm();
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleEditInventory = (item: IBranchInventory) => {
    setEditingInventory(item);
    setNewInventory(item);
    setValidationErrors({});
    setShowInventoryModal(true);
  };

  const handleDeleteInventory = async (inventoryId: string) => {
    if (!isUserRoleValid('super-admin')) {
      if (!isUserPermissionsValid(['inventory.delete'])) navigate(-1);
    }
    try {
      if (window.confirm('Are you sure you want to delete this inventory entry?')) {
        await deleteInventory(inventoryId);
        setInventory(inventory.filter((item) => item.id !== inventoryId));
      }
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleToggleStatus = (inventoryId: string) => {
    setInventory(inventory.map((item) => (item.id === inventoryId ? { ...item, isActive: !item.isActive } : item)));
  };

  const handleToggleSelectedBranch = () => {
    setNewInventory((prev) => ({
      ...prev,
      isAllBranchSelected: !prev.isAllBranchSelected,
    }));
  };

  const handleToggleSelectedProduct = () => {
    setNewInventory((prev) => ({
      ...prev,
      isAllProductSelected: !prev.isAllProductSelected,
    }));
  };

  const handleFieldChange = (field: keyof IBranchInventory, value: any) => {
    setNewInventory((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setNewInventory({
      isActive: true,
      quantityOnHand: 0,
      quantityReserved: 0,
      costPrice: 0,
      sellingPrice: 0,
    });
    setEditingInventory(null);
    setValidationErrors({});
    setBranchSearch('');
    setProductSearch('');
    setShowBranchDropdown(false);
    setShowProductDropdown(false);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getAvailableQuantity = (item: IBranchInventory) => {
    return (item.quantityOnHand || 0) - (item.quantityReserved || 0);
  };

  const handleInventoryPagination = async (currentPage: number) => {
    try {
      const { data } = await getInventories(currentPage);
      setInventory((prev) => [...prev, ...data.data]);
      setPagination(data.pagination);
    } catch (error: any) {
      alert('something went wrong, try again');
    }
  };

  // page permission protection
  if (!isUserRoleValid('super-admin')) {
    if (!isUserPermissionsValid(['inventory.view'])) navigate(-1);
  }

  // Inventory Row Component
  // Updated Inventory Row Component with Better Spacing
  const InventoryRow: React.FC<{ item: IBranchInventory }> = ({ item }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border-b border-neutral-200 hover:bg-neutral-50">
      {/* Branch and Product Info - 4 columns */}
      <div className="md:col-span-4 flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <FiPackage className="text-primary-600 text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-neutral-900 truncate">{item.product?.name}</h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                item.isActive
              )}`}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-neutral-500 truncate flex items-center">
            <FiMapPin className="mr-1 text-neutral-400" size={12} />
            {item.branch?.name}
          </p>
          <p className="text-xs text-neutral-400">SKU: {item.product?.sku || 'N/A'}</p>
        </div>
      </div>

      {/* Inventory Details - 3 columns */}
      <div className="md:col-span-3 hidden md:block">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-neutral-500 text-xs mb-1">On Hand</p>
            <p className="font-medium text-lg">{item.quantityOnHand || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-neutral-500 text-xs mb-1">Reserved</p>
            <p className="font-medium text-lg text-yellow-600">{item.quantityReserved || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-neutral-500 text-xs mb-1">Available</p>
            <p className={`font-medium text-lg ${getAvailableQuantity(item) <= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {getAvailableQuantity(item)}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing - 3 columns */}
      <div className="md:col-span-3 hidden md:block">
        <div className="text-right space-y-1">
          <p className="text-lg font-bold text-neutral-900">
            {CurrencySymbols[item.product?.currency as CurrencyCode]}
            {item.sellingPrice.toFixed(2)}
          </p>
          {item.costPrice && item.costPrice > 0 && (
            <>
              <p className="text-sm text-neutral-500">
                Cost: {CurrencySymbols[item.product?.currency as CurrencyCode]}
                {item.costPrice.toFixed(2)}
              </p>
              <p
                className={`text-xs font-medium ${
                  item.sellingPrice - item.costPrice >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                Margin: {(((item.sellingPrice - item.costPrice) / item.costPrice) * 100).toFixed(1)}%
              </p>
            </>
          )}
        </div>
      </div>

      {/* Actions - 2 columns */}
      <div className="md:col-span-2 flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => handleEditInventory(item)} className="min-w-[80px]">
          <FiEdit className="md:mr-1" />
          <span className="hidden md:inline">Edit</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteInventory(item.id!)}
          className="min-w-[80px] text-error hover:bg-error-50"
        >
          <FiTrash2 className="md:mr-1" />
          <span className="hidden md:inline">Delete</span>
        </Button>
      </div>

      {/* Mobile details */}
      <div className="md:hidden col-span-1 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-500">On Hand</p>
            <p className="font-medium text-lg">{item.quantityOnHand || 0}</p>
          </div>
          <div>
            <p className="text-neutral-500">Reserved</p>
            <p className="font-medium text-lg text-yellow-600">{item.quantityReserved || 0}</p>
          </div>
          <div>
            <p className="text-neutral-500">Available</p>
            <p className={`font-medium text-lg ${getAvailableQuantity(item) <= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {getAvailableQuantity(item)}
            </p>
          </div>
          <div>
            <p className="text-neutral-500">Price</p>
            <p className="font-medium text-lg">${item.sellingPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(item.id!)}>
            {item.isActive ? 'Deactivate' : 'Activate'}
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleEditInventory(item)}>
              <FiEdit />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteInventory(item.id!)}
              className="text-error hover:bg-error-50"
            >
              <FiTrash2 />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Branch Inventory</h2>
          <p className="text-neutral-600 mt-1">Manage inventory across all branches</p>
        </div>

        <Button
          onClick={() => {
            setShowInventoryModal(true);
            resetForm();
          }}
        >
          <FiPlus className="mr-2" />
          Add Inventory
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
              placeholder="Search by branch name, product name, or SKU..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Branch Filter Dropdown */}
          <div className="md:w-64">
            <select
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              value={selectedPageBranch || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedPageBranch(value || '');
              }}
            >
              <option value="">All Branches</option>
              {pageBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {/* Header Row - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-sm font-medium text-neutral-700">
          <div className="col-span-4">Product & Branch</div>
          <div className="col-span-3 text-center">Inventory Levels</div>
          <div className="col-span-3 text-right">Pricing Information</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Inventory Items */}
        {inventory?.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <FiBox className="mx-auto text-4xl text-neutral-300 mb-3" />
            <p>No inventory items found{searchTerm && ` matching "${searchTerm}"`}</p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {inventory.map((item) => (
              <InventoryRow key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination?.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0">
            <div className="text-sm text-neutral-500">
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems}{' '}
              items
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => setPagination((prev) => ({ ...prev!, currentPage: prev!.currentPage - 1 }))}
              >
                <FiChevronLeft className="mr-1" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => handleInventoryPagination(pagination.currentPage + 1)}
              >
                Next
                <FiChevronRight className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">
                {editingInventory ? 'Edit Inventory' : 'Add New Inventory'}
              </h3>
              <button
                onClick={() => {
                  setShowInventoryModal(false);
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

              {/* Branch Selection */}
              <div className="relative">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Branch *</label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newInventory.isAllBranchSelected}
                    onChange={() => handleToggleSelectedBranch()}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-neutral-700">Add All Branches</span>
                </label>
                {!newInventory.isAllBranchSelected && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for a branch..."
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={branchSearch}
                      onChange={(e) => {
                        setBranchSearch(e.target.value);
                        setShowBranchDropdown(true);
                      }}
                      onFocus={() => setShowBranchDropdown(true)}
                    />
                    {showBranchDropdown && (
                      <div
                        className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        ref={BranchDropdownRefs}
                        onScroll={hanldeBrachLoadDataOnScroll}
                      >
                        {branches.map((branch) => (
                          <div
                            key={branch.id}
                            className="px-4 py-3 hover:bg-neutral-100 cursor-pointer border-b border-neutral-200 last:border-b-0"
                            onClick={() => {
                              handleFieldChange('branchId', branch.id);
                              setBranchSearch(branch.name);
                              setShowBranchDropdown(false);
                            }}
                          >
                            <div className="font-medium">{branch.name}</div>
                            <div className="text-sm text-neutral-500">{branch.code}</div>
                          </div>
                        ))}
                        {branchPagination?.totalPages === 0 && (
                          <div className="px-4 py-3 text-neutral-500">No branches found</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {validationErrors.branchId && (
                  <span className="text-error text-sm mt-1">{validationErrors.branchId}</span>
                )}
              </div>

              {/* Product Selection */}
              <div className="relative">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Product *</label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newInventory.isAllProductSelected}
                    onChange={() => handleToggleSelectedProduct()}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-neutral-700">Add All Products</span>
                </label>
                {!newInventory.isAllProductSelected && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for a product..."
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                    />
                    {showProductDropdown && (
                      <div
                        className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        ref={ProductDropdownRefs}
                        onScroll={hanldeProductLoadDataOnScroll}
                      >
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="px-4 py-3 hover:bg-neutral-100 cursor-pointer border-b border-neutral-200 last:border-b-0"
                            onClick={() => {
                              handleFieldChange('productId', product.id);
                              setProductSearch(product.name);
                              setNewInventory((prevState) => ({ ...prevState, sellingPrice: product.price }));
                              setShowProductDropdown(false);
                            }}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-neutral-500">
                              SKU: {product.sku} | ${product.price.toFixed(2)}
                            </div>
                          </div>
                        ))}
                        {productPagination?.totalPages === 0 && (
                          <div className="px-4 py-3 text-neutral-500">No products found</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {validationErrors.productId && (
                  <span className="text-error text-sm mt-1">{validationErrors.productId}</span>
                )}
              </div>

              {/* Inventory Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Quantity On Hand"
                  type="number"
                  value={newInventory.quantityOnHand}
                  onChange={(e) => handleFieldChange('quantityOnHand', parseInt(e.target.value))}
                  error={validationErrors.quantityOnHand}
                  min="0"
                  max="100000"
                />

                <Input
                  label="Quantity Reserved"
                  type="number"
                  value={newInventory.quantityReserved}
                  onChange={(e) => handleFieldChange('quantityReserved', parseInt(e.target.value))}
                  error={validationErrors.quantityReserved}
                  min="0"
                  max={newInventory.quantityOnHand}
                />

                <Input
                  label="Cost Price"
                  type="number"
                  step="0.01"
                  value={newInventory.costPrice}
                  onChange={(e) => handleFieldChange('costPrice', parseFloat(e.target.value))}
                  error={validationErrors.costPrice}
                  min="0"
                  max="1000000"
                />
              </div>

              <Input
                label="Selling Price *"
                type="number"
                step="0.01"
                value={newInventory.sellingPrice}
                onChange={(e) => handleFieldChange('sellingPrice', parseFloat(e.target.value))}
                error={validationErrors.sellingPrice}
                required
                min="0"
                max="1000000"
              />

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newInventory.isActive ?? true}
                  onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-neutral-700">Active Inventory</span>
              </label>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInventoryModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingInventory ? handleUpdateInventory : handleCreateInventory}>
                  <FiSave className="mr-2" />
                  {editingInventory ? 'Update Inventory' : 'Create Inventory'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchInventoryPage;
