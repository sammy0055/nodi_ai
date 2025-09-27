// src/components/pages/ProductsPage/ProductsPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiUpload,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiShoppingBag,
  FiAlertCircle,
  FiX,
  FiImage,
  FiSave,
} from 'react-icons/fi';
import Input from '../../components/atoms/Input/Input';
import Button from '../../components/atoms/Button/Button';
import type { Product, ProductOptionChoice, ProductOption } from '../../types/product';
import { ProductService } from '../../services/productService';
import {
  useProductOptionSetRecoilState,
  useProductOptionValue,
  useProductsSetRecoilState,
  useProductsValue,
  useWhatsappValue,
} from '../../store/authAtoms';
import { useDebounce } from 'use-debounce';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
// Define types based on your schema
const ProductStatusTypes = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
};

const ProductOptionType = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
};

const ProductOptionsManager: React.FC<{
  productId: string;
  options: ProductOption[];
  onOptionsChange: (options: ProductOption[]) => void;
}> = ({ productId, options, onOptionsChange }) => {
  const productOptions = options.filter((opt) => opt.productId === productId);
  const { addProductOption, addProductOptionChoice, deleteProductChoice, deleteProductOption } = new ProductService();
  const addOption = async () => {
    const newOption: ProductOption = {
      id: `opt-${Date.now()}`,
      productId,
      name: 'New Option',
      type: 'single',
      isRequired: false,
    };

    const { data } = await addProductOption(newOption);
    const choices = {
      id: `choice-${Date.now()}-1`,
      productOptionId: data.id,
      label: 'Choice 1',
      priceAdjustment: 0,
      isDefault: true,
    };

    const { data: choice } = await addProductOptionChoice(choices);
    const newOptionAndChoice: ProductOption = {
      ...data,
      choices: [choice],
    };
    onOptionsChange([...options, newOptionAndChoice]);
  };

  const updateOption = (optionId: string, updates: Partial<ProductOption>) => {
    onOptionsChange(options.map((opt) => (opt.id === optionId ? { ...opt, ...updates } : opt)));
  };

  const deleteOption = async (optionId: string) => {
    try {
      await deleteProductOption(optionId);
      onOptionsChange(options.filter((opt) => opt.id !== optionId));
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const addChoice = async (optionId: string) => {
    try {
      const choices = {
        id: `choice-${Date.now()}-1`,
        productOptionId: optionId,
        label: 'New Choice',
        priceAdjustment: 0,
        isDefault: true,
      };

      const { data: newChoice } = await addProductOptionChoice(choices);

      onOptionsChange(
        options.map((opt) => (opt.id === optionId ? { ...opt, choices: [...opt.choices!, newChoice] } : opt))
      );
    } catch (error: any) {
      alert('something went wrong, try again');
      console.error(error.message);
    }
  };

  const updateChoice = (optionId: string, choiceId: string, updates: Partial<ProductOptionChoice>) => {
    onOptionsChange(
      options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              choices: opt.choices?.map((choice) => (choice.id === choiceId ? { ...choice, ...updates } : choice)),
            }
          : opt
      )
    );
  };

  const deleteChoice = async (optionId: string, choiceId: string) => {
    try {
      await deleteProductChoice(choiceId);
      onOptionsChange(
        options.map((opt) =>
          opt.id === optionId ? { ...opt, choices: opt.choices?.filter((choice) => choice.id !== choiceId) } : opt
        )
      );
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-neutral-900">Product Options</h4>
        <Button size="sm" onClick={addOption}>
          <FiPlus className="mr-1" />
          Add Option
        </Button>
      </div>

      {productOptions.length === 0 ? (
        <div className="text-center py-6 text-neutral-500 border-2 border-dashed border-neutral-300 rounded-lg">
          <FiPackage className="mx-auto text-3xl mb-2" />
          <p>No options added yet</p>
        </div>
      ) : (
        productOptions.map((option) => (
          <div key={option.id} className="border border-neutral-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Option Name"
                  value={option.name}
                  onChange={(e) => updateOption(option.id, { name: e.target.value })}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700">Option Type</label>
                  <select
                    className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={option.type}
                    onChange={(e) => updateOption(option.id, { type: e.target.value as any })}
                  >
                    <option value={ProductOptionType.SINGLE}>Single Choice</option>
                    <option value={ProductOptionType.MULTIPLE}>Multiple Choice</option>
                  </select>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteOption(option.id)}
                className="ml-4 text-error hover:bg-error-50"
              >
                <FiTrash2 />
              </Button>
            </div>

            <div className="flex items-center space-x-4 mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={option.isRequired}
                  onChange={(e) => updateOption(option.id, { isRequired: e.target.checked })}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-neutral-700">Required</span>
              </label>
            </div>

            {/* Choices */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="font-medium text-neutral-700">Choices</h5>
                <Button size="sm" variant="outline" onClick={() => addChoice(option.id)}>
                  <FiPlus className="mr-1" />
                  Add Choice
                </Button>
              </div>

              {option?.choices?.map((choice) => (
                <div key={choice.id} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <Input
                    label="Label"
                    value={choice.label}
                    onChange={(e: any) => updateChoice(option.id, choice.id, { label: e.target.value })}
                    className="flex-1"
                    // size="sm"
                  />

                  <Input
                    label="Price Adjustment"
                    type="number"
                    value={choice.priceAdjustment}
                    onChange={(e: any) =>
                      updateChoice(option.id, choice.id, { priceAdjustment: parseFloat(e.target.value) || 0 })
                    }
                    className="w-32"
                    // size="sm"
                  />

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`default-${option.id}`}
                      checked={choice.isDefault}
                      onChange={() => {
                        // Set all choices in this option to not default, then set this one to default
                        const updatedChoices = option?.choices?.map((c) => ({
                          ...c,
                          isDefault: c.id === choice.id,
                        }));
                        updateOption(option.id, { choices: updatedChoices });
                      }}
                      className="rounded-full border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-neutral-700">Default</span>
                  </label>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteChoice(option.id, choice.id)}
                    className="text-error hover:bg-error-50"
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Main Products Page Component
const ProductsPage: React.FC = () => {
  // const [products, setProducts] = useState<Product[]>(initialProducts);
  const products = useProductsValue();
  const setProducts = useProductsSetRecoilState();
  const productOptions = useProductOptionValue();
  const setProductOptions = useProductOptionSetRecoilState();
  const whatsappData = useWhatsappValue();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const { addProduct, updateProduct, deleteProduct, searchProducts, updateProductOption, updateProductChoice } =
    new ProductService();

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const navigate = useNavigate();
  const handleCreateCatalog = () => {
    navigate(`/app/${PageRoutes.SETTINGS}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this product?')) {
        await deleteProduct(productId);
        setProducts(products.filter((product) => product.id !== productId));
        // Also remove associated options
        setProductOptions(productOptions.filter((opt) => opt.productId !== productId));
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditingProduct({ ...product });
    setShowProductModal(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setEditingProduct({
      // id: "",
      // organizationId: '',
      sku: '',
      status: 'active',
      name: '',
      price: 0,
      description: '',
      currency: 'USD',
      metaProductId: '',
      imageUrl: '',
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (selectedProduct) {
        // Update existing product
        const { data } = await updateProduct(editingProduct as Product);
        if (productOptions.length !== 0) {
          const optionChoices = productOptions.flatMap((item) => item.choices || []);
          const { data } = await updateProductOption(productOptions as any);
          if (optionChoices.length !== 0) {
            const { data: choiceData } = await updateProductChoice(optionChoices as any);
            setProductOptions((prevState) => [...prevState, { ...data, choices: choiceData as any }]);
            setShowProductModal(false);
            setEditingProduct({});
            return;
          }

          setProductOptions((prevState) => [...prevState, data]);
        }

        setProducts(products.map((p) => (p.id === selectedProduct.id ? { ...(data as Product) } : p)));
      } else {
        // Add new product
        const { data } = await addProduct(editingProduct as Product);
        setProducts([...products, data as Product]);
      }
      setShowProductModal(false);
      setEditingProduct({});
    } catch (error: any) {
      alert('something went wrong');
      console.log(error.message);
    }
  };

  const [debouncedTerm] = useDebounce(searchTerm, 500); // 500ms delay

  useEffect(() => {
    const searchProductFn = async () => {
      if (!debouncedTerm) {
        // maybe clear results
        return;
      }
      // call your search API
      const data = await searchProducts(searchTerm);
      setProducts(data.data.data);
    };
    searchProductFn();
  }, [debouncedTerm]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate image upload and get URL
      const imageUrl = URL.createObjectURL(file);
      setEditingProduct((prev) => ({ ...prev, imageUrl, file }));
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing
      const reader = new FileReader();
      reader.onload = (e) => {
        // Parse CSV and create products (simplified)
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const importedProducts: Product[] = [];

        lines.slice(1).forEach((line, index) => {
          if (line.trim()) {
            const [name, sku, price, description] = line.split(',');
            importedProducts.push({
              id: `imported-${Date.now()}-${index}`,
              organizationId: 'org-001',
              sku: sku || `IMPORT-${index}`,
              status: 'draft',
              name: name || `Imported Product ${index}`,
              price: parseFloat(price) || 0,
              description: description || '',
              currency: 'USD',
              metaProductId: `meta-imported-${Date.now()}-${index}`,
            });
          }
        });

        setProducts([...products, ...importedProducts]);
        setShowImportModal(false);
      };
      reader.readAsText(file);
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case ProductStatusTypes.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ProductStatusTypes.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case ProductStatusTypes.ARCHIVED:
        return 'bg-neutral-100 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  // WhatsApp Catalog Warning Component
  const CatalogWarning = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <FiAlertCircle className="text-yellow-600 mr-3 text-xl" />
        <div className="flex-1">
          <h3 className="text-yellow-800 font-medium">WhatsApp Catalog Required</h3>
          <p className="text-yellow-700 text-sm mt-1">
            You need to create a WhatsApp product catalog to manage products for WhatsApp Business.
          </p>
        </div>
        <Button onClick={handleCreateCatalog}>
          <FiShoppingBag className="mr-2" />
          Create Catalog
        </Button>
      </div>
    </div>
  );

  // Product Row Component
  const ProductRow: React.FC<{ product: Product }> = ({ product }) => {
    const productOpts = productOptions.filter((opt) => opt.productId === product.id);

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border-b border-neutral-200 hover:bg-neutral-50">
        {/* Image and Name */}
        <div className="md:col-span-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <FiPackage className="text-neutral-400 text-xl" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-neutral-900 truncate">{product.name}</h4>
            <p className="text-sm text-neutral-500 truncate">{product.sku}</p>
            <p className="text-xs text-neutral-400">{productOpts.length} options</p>
          </div>
        </div>

        {/* Price */}
        <div className="md:col-span-2">
          <span className="font-medium text-neutral-900">
            {product.currency} {product.price}
          </span>
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              product.status
            )}`}
          >
            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
          </span>
        </div>

        {/* Actions */}
        <div className="md:col-span-4 flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
            <FiEdit className="mr-1" />
            <span className="hidden md:inline">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteProduct(product.id)}
            className="text-error hover:bg-error-50"
          >
            <FiTrash2 className="mr-1" />
            <span className="hidden md:inline">Delete</span>
          </Button>
        </div>
      </div>
    );
  };

  if (!whatsappData?.catalogId) return <CatalogWarning />;

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Products</h2>
          <p className="text-neutral-600 mt-1">Manage your product catalog</p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <FiUpload className="mr-2" />
            Import
          </Button> */}
          <Button onClick={handleAddProduct}>
            <FiPlus className="mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* WhatsApp Catalog Warning */}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-medium p-4">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, SKU, or description..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* <div className="flex space-x-3">
            <select className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div> */}
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {/* Header Row - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-sm font-medium text-neutral-700">
          <div className="col-span-4">Product</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-4 text-right">Actions</div>
        </div>

        {/* Products */}
        {currentProducts.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <FiPackage className="mx-auto text-4xl text-neutral-300 mb-3" />
            <p>No products found{searchTerm && ` matching "${searchTerm}"`}</p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {currentProducts.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0">
            <div className="text-sm text-neutral-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
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

      {/* Add/Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Image Upload */}
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-2">Product Image</label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {editingProduct.imageUrl ? (
                      <img src={editingProduct.imageUrl} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <FiImage className="text-neutral-400 text-2xl" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <FiUpload className="mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />

                <Input
                  label="SKU"
                  value={editingProduct.sku || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  required
                />

                <Input
                  label="Price"
                  type="number"
                  value={editingProduct.price || 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700">Status</label>
                  <select
                    className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={editingProduct.status || ProductStatusTypes.DRAFT}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                  >
                    {/* <option value={ProductStatusTypes.DRAFT}>Draft</option> */}
                    <option value={ProductStatusTypes.ACTIVE}>Active</option>
                    <option value={ProductStatusTypes.ARCHIVED}>Archived</option>
                  </select>
                </div>
              </div>

              <Input
                label="Description"
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                textarea
                rows={3}
              />

              {/* Product Options */}
              {editingProduct.id && (
                <ProductOptionsManager
                  productId={editingProduct.id}
                  options={productOptions}
                  onOptionsChange={setProductOptions}
                />
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <Button variant="outline" onClick={() => setShowProductModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct}>
                  <FiSave className="mr-2" />
                  {selectedProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">Import Products</h3>
              <button onClick={() => setShowImportModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-neutral-600">
                Upload a CSV file with your product data. Expected columns: Name, SKU, Price, Description
              </p>

              <div
                className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
                onClick={() => importFileInputRef.current?.click()}
              >
                <FiUpload className="mx-auto text-3xl text-neutral-400 mb-3" />
                <p className="text-neutral-600">Click to select a CSV file or drag and drop</p>
                <p className="text-sm text-neutral-500 mt-1">CSV files only</p>
              </div>

              <input
                type="file"
                ref={importFileInputRef}
                onChange={handleImportFile}
                accept=".csv"
                className="hidden"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-800 text-sm">Sample CSV Format:</h4>
                <pre className="text-xs text-blue-700 mt-1">
                  {`Name,SKU,Price,Description\nWireless Headphones,SKU-001,79.99,High-quality headphones\nSmart Watch,SKU-002,199.99,Feature-rich smartwatch`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
