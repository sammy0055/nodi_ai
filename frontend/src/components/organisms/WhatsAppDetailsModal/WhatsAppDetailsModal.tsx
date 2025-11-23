// src/components/organisms/WhatsAppDetailsModal/WhatsAppDetailsModal.tsx
import React, { useState, useEffect } from 'react';
import { FiSave, FiMessageSquare, FiShoppingBag, FiAlertCircle, FiX } from 'react-icons/fi';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';
import { BsFillBuildingFill } from 'react-icons/bs';

// Define the interface for WhatsApp details
export interface IWhatsAppDetails {
  id?: string;
  whatsappBusinessId: string;
  organizationId: string;
  organizationName: string;
  catalogId: string;
}

interface WhatsAppDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (details: IWhatsAppDetails) => Promise<void>;
  initialData?: IWhatsAppDetails;
}

// Mock data for existing WhatsApp details
const defaultWhatsAppDetails: IWhatsAppDetails = {
  id: 'whatsapp-001',
  whatsappBusinessId: '1234567890',
  organizationId: 'org-001',
  organizationName: 'flex',
  catalogId: 'catalog_12345',
};

const WhatsAppDetailsModal: React.FC<WhatsAppDetailsModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [whatsappDetails, setWhatsappDetails] = useState<IWhatsAppDetails>(defaultWhatsAppDetails);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof IWhatsAppDetails, string>>>({});

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setWhatsappDetails(initialData);
      } else {
        setWhatsappDetails({
          ...defaultWhatsAppDetails,
        });
      }
      setSaveStatus('idle');
      setValidationErrors({});
    }
  }, [isOpen, initialData]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
      // Call onSave callback if provided
      if (onSave) {
        await onSave(whatsappDetails);
        setSaveStatus('success');
      }
    } catch (error: any) {
      setSaveStatus('error');
      console.error('Failed to update WhatsApp details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setWhatsappDetails(initialData);
    } else {
      setWhatsappDetails({
        ...defaultWhatsAppDetails,
      });
    }
    setValidationErrors({});
    setSaveStatus('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">WhatsApp Business Details</h2>
              <p className="text-neutral-600 text-sm mt-1">
                Update catalog settings {whatsappDetails.organizationName && `For ${whatsappDetails.organizationName}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-lg hover:bg-neutral-100"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Status Messages */}
            {saveStatus === 'success' && (
              <div className="flex items-center p-3 bg-success-50 border border-success-200 text-success-700 rounded-lg mb-4">
                <FiSave className="mr-2 text-success-600" />
                WhatsApp details updated successfully!
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="flex items-center p-3 bg-error-50 border border-error-200 text-error-700 rounded-lg mb-4">
                <FiAlertCircle className="mr-2 text-error-600" />
                Failed to update WhatsApp details. Please try again.
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* WhatsApp Business ID - Disabled */}
              <div>
                <Input
                  label="WhatsApp Business ID"
                  value={whatsappDetails.whatsappBusinessId}
                  onChange={(e) => handleFieldChange('whatsappBusinessId', e.target.value)}
                  error={validationErrors.whatsappBusinessId}
                  placeholder="WhatsApp Business ID"
                  leftIcon={<FiMessageSquare className="text-neutral-400" />}
                  disabled
                />
                <p className="text-xs text-neutral-500 mt-1">Unique identifier for your WhatsApp Business account</p>
              </div>

              {/* Organization ID - Disabled */}
              <div>
                <Input
                  label="Organization ID"
                  value={whatsappDetails.organizationId}
                  onChange={(e) => handleFieldChange('organizationId', e.target.value)}
                  error={validationErrors.organizationId}
                  placeholder="Organization ID"
                  leftIcon={<BsFillBuildingFill className="text-neutral-400" />}
                  disabled
                />
                <p className="text-xs text-neutral-500 mt-1">Organization associated with this WhatsApp account</p>
              </div>

              {/* Catalog ID - Enabled */}
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
                  Update the product catalog ID for your WhatsApp Business account
                </p>
              </div>

              {/* Current Details Summary */}
              <div className="border-t border-neutral-200 pt-4 mt-4">
                <h3 className="font-medium text-neutral-800 mb-3 text-sm">Current Configuration</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Business ID:</span>
                    <span className="font-medium">{whatsappDetails.whatsappBusinessId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Organization:</span>
                    <span className="font-medium">{whatsappDetails.organizationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Catalog:</span>
                    <span className="font-medium">{whatsappDetails.catalogId}</span>
                  </div>
                </div>
              </div>

              {/* Information Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-blue-800 mb-2 text-sm flex items-center">
                  <FiAlertCircle className="mr-2" size={14} />
                  Important Information
                </h3>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• Only catalog ID can be modified</li>
                  <li>• Changes may affect live WhatsApp services</li>
                  <li>• Ensure catalog ID matches your product catalog</li>
                </ul>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
            <Button variant="outline" onClick={handleReset} disabled={isLoading} size="sm">
              Reset
            </Button>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} disabled={isLoading} size="sm">
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={isLoading} size="sm">
                <FiSave className="mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppDetailsModal;
