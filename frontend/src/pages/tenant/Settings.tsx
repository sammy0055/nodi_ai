import React, { useEffect, useState } from 'react';
import {
  FiSave,
  FiEdit,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiShoppingBag,
  FiExternalLink,
  FiHelpCircle,
  FiClock,
  FiPlus,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { useOrgSetRecoilState, useOrgValue, useWhatsappSetRecoilState, useWhatsappValue } from '../../store/authAtoms';
import { OrganizationService } from '../../services/organizationService';
import { useWhatsAppSignup } from '../../hooks/whatsapp';
import type { BaseRequestAttributes } from '../../types/request';
import { CurrencyCode } from '../../types/product';

const SettingsPage: React.FC = () => {
  const orgData = useOrgValue();
  const setOrgData = useOrgSetRecoilState();
  const whatsappData = useWhatsappValue();
  const setWhatsappData = useWhatsappSetRecoilState();
  const WABA_AUTH_CONFIG = import.meta.env.VITE_META_WABA_CONFIG_AUTH_ID;
  const WABA_REDIRECT_URL = import.meta.env.VITE_META_REDIRECT_URL;
  const { status, sdkResponse, sessionInfo, launchWhatsAppSignup } = useWhatsAppSignup(
    WABA_AUTH_CONFIG,
    WABA_REDIRECT_URL
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [catalogRequest, setCatalogRequest] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { updateOrganization, exchangeCodeForAccessToken, requestCatalogCreation, getOrganizationRequest } =
    new OrganizationService();
  const handleOrgChange = (field: string, value: string) => {
    setOrgData((prev) => ({ ...prev!, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await updateOrganization({ ...orgData, organizationId: orgData.id } as any);
      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsappOnboarding = async () => {
    setIsLoading(true);
    launchWhatsAppSignup();
  };

  useEffect(() => {
    const fn = async () => {
      const { data } = await getOrganizationRequest('CatalogRequest');
      setCatalogRequest({
        title: data.title,
        description: data.description,
        status: data.status,
        requestType: 'CatalogRequest',
      });
    };
    fn();
  }, []);

  useEffect(() => {
    if (!sessionInfo) return;
    const exchangeCode = async () => {
      try {
        if (status === 'ERROR') throw new Error(sessionInfo?.data.error_message || 'something went wrong');
        if (status === 'CANCEL') throw new Error(`cancel at this step: ${sessionInfo?.data.current_step}`);
        const WABA = {
          code: sdkResponse?.authResponse?.code!,
          whatsappBusinessId: sessionInfo?.data.waba_id!,
          whatsappPhoneNumberId: sessionInfo?.data.phone_number_id!,
        };

        const { data } = await exchangeCodeForAccessToken(WABA);
        setWhatsappData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('WhatsApp onboarding failed', error);
      } finally {
        setIsLoading(false);
      }
    };
    exchangeCode();
  }, [sessionInfo, sdkResponse]);

  const handleLanguageTermChange = (index: number, value: string) => {
    const updatedFeatures = [...(orgData.languageProtectedTerms || [])];
    updatedFeatures[index] = value;
    setOrgData((prev) => ({ ...prev, languageProtectedTerms: updatedFeatures }));
  };

  const addFeatureField = () => {
    setOrgData((prev) => ({ ...prev, languageProtectedTerms: [...(prev.languageProtectedTerms || []), ''] }));
  };

  const removeFeatureField = (index: number) => {
    const updatedFeatures = orgData.languageProtectedTerms?.filter((_, i) => i !== index) || [];
    setOrgData((prev) => ({ ...prev, languageProtectedTerms: updatedFeatures }));
  };

  const handleCatalogCreation = async () => {
    setIsLoading(true);
    try {
      // Simulate catalog creation process
      const requestInput: BaseRequestAttributes = {
        title: 'create catalog for my business',
        description: 'create catalog on meta dashboard for my business so i can start adding products',
        requestType: 'CatalogRequest',
      };

      const { data } = await requestCatalogCreation(requestInput);
      setCatalogRequest({
        title: data.title,
        description: data.description,
        status: data.status,
        requestType: 'CatalogRequest',
      });
    } catch (error) {
      console.error('Catalog creation failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900">Settings</h2>
        {isEditing ? (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
              <FiX className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isLoading}>
              <FiSave className="mr-2" />
              Save Changes
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <FiEdit className="mr-2" />
            Edit Settings
          </Button>
        )}
      </div>

      {/* Save Status Indicator */}
      {saveStatus === 'success' && (
        <div className="flex items-center p-3 bg-success-50 border border-success-200 text-success-700 rounded-lg">
          <FiCheck className="mr-2 text-success-600" />
          Settings saved successfully!
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="flex items-center p-3 bg-error-50 border border-error-200 text-error-700 rounded-lg">
          <FiX className="mr-2 text-error-600" />
          Failed to save settings. Please try again.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Settings Card */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <FiShoppingBag className="mr-2 text-primary-600" />
            Organization Settings
          </h3>

          <div className="space-y-4">
            <Input
              label="Business Name"
              value={orgData?.name || ''}
              onChange={(e) => handleOrgChange('name', e.target.value)}
              disabled={!isEditing}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Business Type</label>
              <div className="px-4 py-3 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-500">
                {orgData && orgData.businessType.charAt(0).toUpperCase() + orgData.businessType.slice(1)}
              </div>
              <p className="text-xs text-neutral-500">Business type cannot be changed after creation</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Currency</label>
              <select
                className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={orgData.currency}
                disabled={!isEditing}
                onChange={(e) => setOrgData((prev) => ({ ...prev, currency: e.target.value }))}
              >
                {/* <option value={ProductStatusTypes.DRAFT}>Draft</option> */}
                {Object.values(CurrencyCode).map((currency) => (
                  <option value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            <Input
              label="AI Assistant Name"
              value={orgData.AIAssistantName}
              onChange={(e) => handleOrgChange('AIAssistantName', e.target.value)}
              disabled={!isEditing}
              placeholder="Give your AI assistant a name"
            />

            {/* languageProtectedTerms */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">languageProtectedTerms *</label>
              <div className="space-y-2">
                {orgData?.languageProtectedTerms?.map((feature, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={feature}
                      disabled={!isEditing}
                      onChange={(e) => handleLanguageTermChange(index, e.target.value)}
                      placeholder="Add a feature (e.g., 20M AI tokens)"
                      className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {orgData.languageProtectedTerms && orgData.languageProtectedTerms.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isEditing}
                        onClick={() => removeFeatureField(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <FiX />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={addFeatureField} className="mt-3" disabled={!isEditing}>
                <FiPlus className="mr-2" />
                Add Feature
              </Button>
            </div>
          </div>
        </div>

        {/* WhatsApp Settings Card */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <FiMessageSquare className="mr-2 text-primary-600" />
            WhatsApp Business Settings
          </h3>

          <div className="space-y-6">
            {/* Connection Status */}
            <div>
              <h4 className="font-medium text-neutral-800 mb-2">Connection Status</h4>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  whatsappData?.connectionStatus === 'connected'
                    ? 'bg-success-100 text-success-800'
                    : 'bg-warning-100 text-warning-800'
                }`}
              >
                {whatsappData?.connectionStatus === 'connected' ? (
                  <>
                    <FiCheck className="mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <FiX className="mr-1" />
                    Not Connected
                  </>
                )}
              </div>

              {whatsappData?.connectionStatus !== 'connected' ? (
                <div className="mt-4">
                  <p className="text-sm text-neutral-600 mb-3">
                    Connect your WhatsApp Business Account to start using AI agents for customer interactions.
                  </p>
                  <Button onClick={handleWhatsappOnboarding} isLoading={isLoading}>
                    <FiMessageSquare className="mr-2" />
                    Connect WhatsApp Business
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">Phone Number ID:</span> {whatsappData.whatsappPhoneNumberId}
                  </p>
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">Webhook Subscription:</span>{' '}
                    {whatsappData.isSubscribedToWebhook ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">Templates:</span> {whatsappData.whatsappTemplates.length} approved
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200 my-4"></div>

            {/* Product Catalog */}
            <div>
              <h4 className="font-medium text-neutral-800 mb-2">Product Catalog</h4>

              {whatsappData?.catalogId ? (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800 mb-3">
                    <FiCheck className="mr-1" />
                    Catalog Active
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    Your product catalog is connected to WhatsApp. Customers can browse your products directly in
                    WhatsApp.
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <FiExternalLink className="mr-2" />
                      View Catalog
                    </Button>
                    <Button variant="outline">
                      <FiEdit className="mr-2" />
                      Manage Products
                    </Button>
                  </div>
                </div>
              ) : catalogRequest ? (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-3">
                    <FiClock className="mr-1" />
                    Request Being Processed
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    Your product catalog request is currently being processed. This usually takes a few minutes. You'll
                    be notified once your catalog is ready.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-medium text-blue-800 text-sm mb-2">Request Details:</h5>
                    <pre className="text-xs text-blue-700 overflow-x-auto">
                      {JSON.stringify(catalogRequest || {}, null, 2)}
                    </pre>
                  </div>
                  <Button variant="outline" className="mt-3" disabled>
                    <FiClock className="mr-2" />
                    Processing Request...
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-800 mb-3">
                    <FiX className="mr-1" />
                    No Catalog
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    Create a product catalog to showcase your products on WhatsApp. This allows customers to browse and
                    purchase directly through WhatsApp.
                  </p>
                  <Button
                    onClick={handleCatalogCreation}
                    isLoading={isLoading}
                    disabled={whatsappData?.connectionStatus !== 'connected'}
                  >
                    <FiShoppingBag className="mr-2" />
                    Create Product Catalog
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-lg shadow-medium p-6 mt-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <FiHelpCircle className="mr-2 text-primary-600" />
          Need Help?
        </h3>
        <p className="text-neutral-600 mb-4">
          If you need assistance with WhatsApp Business setup or have questions about your organization settings, our
          support team is here to help.
        </p>
        <div className="flex space-x-3">
          <Button variant="outline">View Documentation</Button>
          <Button>Contact Support</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
