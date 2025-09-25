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
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { useOrgSetRecoilState, useOrgValue, useWhatsappSetRecoilState, useWhatsappValue } from '../../store/authAtoms';
import { OrganizationService } from '../../services/organizationService';
import { useWhatsAppSignup } from '../../hooks/whatsapp';

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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { updateOrganization, exchangeCodeForAccessToken } = new OrganizationService();
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
        console.log('============sessionInfo====', { sessionInfo, sdkResponse });
        const { data } = await exchangeCodeForAccessToken(WABA);
        console.log('=============exchangeCodeForAccessToken=======================');
        console.log(data);
        console.log('====================================');
        setIsLoading(false);
      } catch (error) {
        console.error('WhatsApp onboarding failed', error);
      } finally {
        setIsLoading(false);
      }
    };
    exchangeCode();
  }, [sessionInfo, sdkResponse]);

  const handleCatalogCreation = async () => {
    setIsLoading(true);
    try {
      // Simulate catalog creation process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setWhatsappData((prev) => ({
        ...prev!,
        catalogId: 'catalog_12345',
      }));
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

            <Input
              label="Brand Tone"
              value={orgData?.brandTone}
              onChange={(e) => handleOrgChange('brandTone', e.target.value)}
              disabled={!isEditing}
              placeholder="Describe your brand's communication style"
            />

            <Input
              label="AI Assistant Name"
              value={orgData.AIAssistantName}
              onChange={(e) => handleOrgChange('AIAssistantName', e.target.value)}
              disabled={!isEditing}
              placeholder="Give your AI assistant a name"
            />
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
                    <span className="font-medium">Phone Number ID:</span> {whatsappData.whatsappPhoneNumberIds[0]}
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
