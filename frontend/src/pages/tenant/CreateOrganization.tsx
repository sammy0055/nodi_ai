import React, { useState } from 'react';
import { FiBriefcase, FiChevronDown } from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import AuthCard from '../../components/molecules/AuthCard/AuthCard';
import Input from '../../components/atoms/Input/Input';
import { OrganizationService } from '../../services/organizationService';
import { FormErrorDisplay } from '../../components/atoms/common/FormErrorDisplay';
import { useNavigate } from 'react-router';

export const businessTypes = [
  { id: 'restaurant', name: 'Restaurant' },
  { id: 'cafe', name: 'Cafe' },
  { id: 'barbershop', name: 'Barbershop' },
  { id: 'beauty-salon', name: 'Beauty Salon' },
  { id: 'ladies-wear', name: 'Ladies Wear' },
  { id: 'men-wear', name: 'Men Wear' },
  { id: 'clothing-store', name: 'Clothing Store' },
  { id: 'shoe-store', name: 'Shoe Store' },
  { id: 'electronics-store', name: 'Electronics Store' },
  { id: 'mobile-shop', name: 'Mobile Shop' },
  { id: 'supermarket', name: 'Supermarket' },
  { id: 'bakery', name: 'Bakery' },
  { id: 'pharmacy', name: 'Pharmacy' },
  { id: 'clinic', name: 'Clinic' },
  { id: 'dentist', name: 'Dentist' },
  { id: 'gym', name: 'Gym' },
  { id: 'spa', name: 'Spa' },
  { id: 'mechanic', name: 'Mechanic' },
  { id: 'car-wash', name: 'Car Wash' },
  { id: 'bookstore', name: 'Bookstore' },
  { id: 'gift-shop', name: 'Gift Shop' },
  { id: 'furniture-store', name: 'Furniture Store' },
  { id: 'ecommerce', name: 'Ecommerce' },
  { id: 'other', name: 'Other' },
] as const;

const CreateOrganizationPage: React.FC = () => {
  const [organizationName, setOrganizationName] = useState('');
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [errors, setErrors] = useState<{ name?: string; businessType?: string }>({});
  const [error, setError] = useState<string | null>(null);


  const navigation = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: { name?: string; businessType?: string } = {};

    if (!organizationName.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!selectedBusinessType) {
      newErrors.businessType = 'Please select a business type';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and submit
    setErrors({});

    setIsLoading(true);

    try {
      const { createOrganization } = new OrganizationService();
      await createOrganization(organizationName, selectedBusinessType);
      setIsLoading(false);
      navigation('/app');
    } catch (err: any) {
      setIsLoading(false);
      // Handle different error types
      if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <AuthCard title="Create Organization" subtitle="Set up your business account to get started">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Error Message Display */}
          {error && <FormErrorDisplay error={error} />}
          <div>
            <Input
              id="organizationName"
              label="Business Name"
              type="text"
              placeholder="Enter your business name"
              value={organizationName}
              onChange={(e) => {
                setOrganizationName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              required
              error={errors.name}
              leftIcon={<FiBriefcase className="text-neutral-400" />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="businessType" className="text-sm font-medium text-neutral-700">
              Business Type
            </label>
            <div className="relative">
              <select
                id="businessType"
                className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                  errors.businessType ? 'border-error' : 'border-neutral-300'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 appearance-none`}
                value={selectedBusinessType}
                onChange={(e) => {
                  setSelectedBusinessType(e.target.value);
                  if (errors.businessType) setErrors({ ...errors, businessType: undefined });
                }}
                required
              >
                <option value="">Select business type</option>
                {businessTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiBriefcase className="text-neutral-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiChevronDown className="text-neutral-400" />
              </div>
            </div>
            {errors.businessType && <span className="text-error text-sm">{errors.businessType}</span>}
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Organization
          </Button>
        </form>
      </AuthCard>
    </div>
  );
};

export default CreateOrganizationPage;
