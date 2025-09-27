// src/components/pages/WhatsAppDetailsPage/WhatsAppDetailsPage.tsx
import React, { useState } from 'react';
import { FiSave, FiMessageSquare, FiShoppingBag, FiAlertCircle } from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { BsFillBuildingFill } from 'react-icons/bs';
import { AdminUserService } from '../../services/admin/AdminUserService';

// Define the interface for WhatsApp details
export interface IWhatsAppDetails {
  id?: string;
  whatsappBusinessId: string;
  organizationId: string;
  catalogId: string;
}

// Mock data for existing WhatsApp details
const mockWhatsAppDetails: IWhatsAppDetails = {
  id: 'whatsapp-001',
  whatsappBusinessId: '1234567890',
  organizationId: 'org-001',
  catalogId: 'catalog_12345',
};

const WhatsAppDetailsPage: React.FC = () => {
  const [whatsappDetails, setWhatsappDetails] = useState<IWhatsAppDetails>(mockWhatsAppDetails);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof IWhatsAppDetails, string>>>({});
const {updateOrganizationWABA} = new AdminUserService()
  // Validation function
  const validateField = (field: keyof IWhatsAppDetails, value: string): string | undefined => {
    if (!value || value.trim().length === 0) {
      return `${field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())} is required`;
    }

    // Additional validation rules
    switch (field) {
      case 'whatsappBusinessId':
        if (!/^\d+$/.test(value)) return 'WhatsApp Business ID must contain only numbers';
        if (value.length < 5) return 'WhatsApp Business ID must be at least 5 digits';
        break;

      case 'organizationId':
        if (value.length < 3) return 'Organization ID must be at least 3 characters';
        break;

      case 'catalogId':
        if (value.length < 3) return 'Catalog ID must be at least 3 characters';
        break;
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const errors = {
      whatsappBusinessId: validateField('whatsappBusinessId', whatsappDetails.whatsappBusinessId),
      organizationId: validateField('organizationId', whatsappDetails.organizationId),
      catalogId: validateField('catalogId', whatsappDetails.catalogId),
    };

    setValidationErrors(errors);
    return !Object.values(errors).some((error) => error !== undefined);
  };

  const handleFieldChange = (field: keyof IWhatsAppDetails, value: string) => {
    setWhatsappDetails((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSaveStatus('idle');

    try {
      // Simulate API call
      await updateOrganizationWABA(whatsappDetails)
      setSaveStatus('success');

    } catch (error:any) {
      setSaveStatus('error');
      console.error('Failed to update WhatsApp details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">WhatsApp Business Details</h2>
          <p className="text-neutral-600 mt-1">Update WhatsApp Business integration settings</p>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setWhatsappDetails(mockWhatsAppDetails)} disabled={isLoading}>
            Reset
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            <FiSave className="mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="flex items-center p-3 bg-success-50 border border-success-200 text-success-700 rounded-lg">
          <FiSave className="mr-2 text-success-600" />
          WhatsApp details updated successfully!
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="flex items-center p-3 bg-error-50 border border-error-200 text-error-700 rounded-lg">
          <FiAlertCircle className="mr-2 text-error-600" />
          Failed to update WhatsApp details. Please try again.
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* WhatsApp Business ID */}
          <div>
            <Input
              label="WhatsApp Business ID *"
              value={whatsappDetails.whatsappBusinessId}
              onChange={(e) => handleFieldChange('whatsappBusinessId', e.target.value)}
              error={validationErrors.whatsappBusinessId}
              placeholder="Enter WhatsApp Business ID (numbers only)"
              leftIcon={<FiMessageSquare className="text-neutral-400" />}
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              The unique identifier for your WhatsApp Business account. This should be a numeric value.
            </p>
          </div>

          {/* Organization ID */}
          <div>
            <Input
              label="Organization ID *"
              value={whatsappDetails.organizationId}
              onChange={(e) => handleFieldChange('organizationId', e.target.value)}
              error={validationErrors.organizationId}
              placeholder="Enter Organization ID"
              leftIcon={<BsFillBuildingFill className="text-neutral-400" />}
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              The ID of the organization associated with this WhatsApp Business account.
            </p>
          </div>

          {/* Catalog ID */}
          <div>
            <Input
              label="Catalog ID *"
              value={whatsappDetails.catalogId}
              onChange={(e) => handleFieldChange('catalogId', e.target.value)}
              error={validationErrors.catalogId}
              placeholder="Enter Catalog ID"
              leftIcon={<FiShoppingBag className="text-neutral-400" />}
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              The ID of the product catalog linked to this WhatsApp Business account.
            </p>
          </div>

          {/* Current Details Summary */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="font-medium text-neutral-800 mb-3">Current Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-neutral-500">WhatsApp Business ID</p>
                <p className="font-medium">{whatsappDetails.whatsappBusinessId || 'Not set'}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-neutral-500">Organization ID</p>
                <p className="font-medium">{whatsappDetails.organizationId || 'Not set'}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-neutral-500">Catalog ID</p>
                <p className="font-medium">{whatsappDetails.catalogId || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Mobile-only submit button */}
          <div className="md:hidden flex justify-center pt-4 border-t border-neutral-200">
            <Button type="submit" isLoading={isLoading} className="w-full">
              <FiSave className="mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center">
          <FiAlertCircle className="mr-2" />
          Important Information
        </h3>
        <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
          <li>All fields are required for proper WhatsApp Business integration</li>
          <li>Changes to these details may affect live WhatsApp services</li>
          <li>Ensure the WhatsApp Business ID is correct before saving</li>
          <li>Catalog ID must match an existing product catalog in your system</li>
          <li>Organization ID should correspond to the correct tenant organization</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatsAppDetailsPage;
