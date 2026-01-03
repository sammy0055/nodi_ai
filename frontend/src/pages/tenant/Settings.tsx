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
  FiUser,
  FiUsers,
  FiKey,
  FiTrash2,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { useOrgSetRecoilState, useOrgValue, useWhatsappSetRecoilState, useWhatsappValue } from '../../store/authAtoms';
import { OrganizationService } from '../../services/organizationService';
import { useWhatsAppSignup } from '../../hooks/whatsapp';
import type { BaseRequestAttributes } from '../../types/request';
import { CurrencyCode } from '../../types/product';
import { useLoaderData } from 'react-router';
import { UserService } from '../../services/userService';
import type { Permission, Role, User } from '../../types/users';
import type { IOrganization } from '../../types/organization';
import FAQManager from '../../components/organisms/settings/fqaManager';

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

  const data = useLoaderData() as {
    users: User[];
    roles: Role[];
    permissions: Permission[];
    organization: IOrganization;
  };

  // State for navigation
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'roles' | 'fqa'>('general');

  // State for Users tab
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (data) {
      setUsers(data.users);
      setRoles(data?.roles || []);
      if (data?.roles?.length !== 0) {
        setSelectedRoleId(data?.roles[0].id);
        if (data?.roles[0]?.permissions) setRolePermissions(new Set(data?.roles[0]?.permissions?.map((p) => p.id)));
      }
      setPermissions(data.permissions);
    }
  }, [data]);

  // State for Roles & Permissions tab
  const [roles, setRoles] = useState<Role[]>([]);

  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>();
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set([]));

  // State for new user form
  const [newUser, setNewUser] = useState({ name: '', email: '', roleId: '2' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<User | null>(null);

  // Existing states from original code
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [catalogRequest, setCatalogRequest] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const {
    updateOrganization,
    exchangeCodeForAccessToken,
    requestCatalogCreation,
    getOrganizationRequest,
    publishWhatsappTemplates,
  } = new OrganizationService();
  const handleOrgChange = (field: string, value: string) => {
    setOrgData((prev) => ({ ...prev!, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
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
      if (!data) return;
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

  const handlePublishTemplates = async () => {
    try {
      setIsLoading(true);
      const { data } = await publishWhatsappTemplates();
      setWhatsappData(data);
      setIsLoading(false);
    } catch (error) {
      alert('Publish WhatsApp failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Users tab functions
  const { deleteUser, updateUser, addUser, setRolePermissions: adminSetRolePermissions } = new UserService();
  const handleAddUser = async () => {
    try {
      if (!newUser.name.trim() || !newUser.email.trim()) return;

      const newUserObj = {
        name: newUser.name,
        email: newUser.email,
        roles: [roles.find((role) => role.id === newUser.roleId) || roles[0]],
      };
      const data = await addUser(newUserObj as any);
      setUsers([...users, data.data as any]);
      setNewUser({ name: '', email: '', roleId: '2' });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditUserData({ ...user });
  };

  const handleSaveEditUser = async () => {
    if (!editUserData) return;

    try {
      await updateUser(editUserData as any);
      setUsers(users.map((user) => (user.id === editUserData.id ? editUserData : user)));
      setEditingUserId(null);
      setEditUserData(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setEditUserData(null);
  };

  // Roles & Permissions functions
  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    // Reset to some default permissions for the role
    const selectedRole = roles.find((r) => r.id === roleId);
    const defaultPermissions = new Set<string>(selectedRole?.permissions?.map((p) => p.id));
    setRolePermissions(defaultPermissions);
  };

  const handlePermissionToggle = (permissionId: string) => {
    const newPermissions = new Set(rolePermissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setRolePermissions(newPermissions);
  };

  const handleSavePermissions = async () => {
    try {
      await adminSetRolePermissions({ permIds: [...rolePermissions], role: selectedRoleId! });
      alert(`Permissions saved for ${roles.find((r) => r.id === selectedRoleId)?.name} role`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSelectAllPermissions = () => {
    const allPermissionIds = permissions.map((p) => p.id);
    setRolePermissions(new Set(allPermissionIds));
  };

  const handleDeselectAllPermissions = () => {
    setRolePermissions(new Set());
  };

  // Render the appropriate content based on active tab
  const renderTabContent = () => {
    if (activeTab === 'general') {
      return renderGeneralTab();
    } else if (activeTab === 'users') {
      return renderUsersTab();
    } else if (activeTab === 'fqa') {
      return renderFQATab();
    } else {
      return renderRolesTab();
    }
  };

  const renderGeneralTab = () => (
    <>
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
                onChange={(e) => setOrgData((prev) => ({ ...prev, currency: e.target.value as any }))}
              >
                {Object.values(CurrencyCode).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
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
                    : whatsappData?.connectionStatus === 'pending'
                    ? 'bg-warning-100 text-warning-600'
                    : 'bg-warning-100 text-warning-800'
                }`}
              >
                {whatsappData?.connectionStatus === 'connected' ? (
                  <>
                    <FiCheck className="mr-1" />
                    Connected
                  </>
                ) : whatsappData?.connectionStatus === 'pending' ? (
                  <>
                    <FiClock className="mr-1" />
                    Pending
                  </>
                ) : (
                  <>
                    <FiX className="mr-1" />
                    Not Connected
                  </>
                )}
              </div>

              {whatsappData?.connectionStatus === 'not-connected' ? (
                <div className="mt-4">
                  <p className="text-sm text-neutral-600 mb-3">
                    Connect your WhatsApp Business Account to start using AI agents for customer interactions.
                  </p>
                  <Button onClick={handleWhatsappOnboarding} isLoading={isLoading}>
                    <FiMessageSquare className="mr-2" />
                    Connect WhatsApp Business
                  </Button>
                </div>
              ) : whatsappData?.connectionStatus === 'pending' ? (
                <div className="mt-4">
                  <p className="text-sm text-neutral-600 mb-3">Publish Pre-Built Templates To Use Our AI Agent</p>
                  <Button onClick={handlePublishTemplates} isLoading={isLoading}>
                    <FiMessageSquare className="mr-2" />
                    Publish Templates
                  </Button>
                </div>
              ) : whatsappData?.connectionStatus === 'connected' ? (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">Phone Number ID:</span> {whatsappData?.whatsappPhoneNumberId}
                  </p>
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">Webhook Subscription:</span>{' '}
                    {whatsappData.isSubscribedToWebhook ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">Templates:</span> {whatsappData.whatsappTemplates.length} approved
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-neutral-600 mb-3">
                    Connect your WhatsApp Business Account to start using AI agents for customer interactions.
                  </p>
                  <Button onClick={handleWhatsappOnboarding} isLoading={isLoading}>
                    <FiMessageSquare className="mr-2" />
                    Connect WhatsApp Business
                  </Button>
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
    </>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900">User Management</h2>
      </div>

      {/* Add New User Form */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <FiUser className="mr-2 text-primary-600" />
          Add New User
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="Enter user's full name"
          />

          <Input
            label="Email Address"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="Enter user's email"
            type="email"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Role</label>
            <select
              className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={newUser.roleId}
              onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleAddUser}>
          <FiPlus className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <FiUsers className="mr-2 text-primary-600" />
          All Users ({users.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editUserData?.name || ''}
                        onChange={(e) => setEditUserData((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                        className="border border-neutral-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {editingUserId === user.id ? (
                      <input
                        type="email"
                        value={editUserData?.email || ''}
                        onChange={(e) => setEditUserData((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                        className="border border-neutral-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm text-neutral-600">{user.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {editingUserId === user.id ? (
                      <select
                        className="border border-neutral-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={(editUserData?.roles && editUserData?.roles[0]?.id) || ''}
                        onChange={(e) => {
                          const selectedRole = roles.find((r) => r.id === e.target.value);
                          if (editUserData && selectedRole) {
                            setEditUserData({ ...editUserData, roles: [selectedRole] });
                          }
                        }}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {user.roles && user.roles[0]?.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {editingUserId === user.id ? (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={handleSaveEditUser}>
                          <FiCheck className="mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEditUser}>
                          <FiX className="mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                          <FiEdit className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <FiUsers className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-2 text-sm font-medium text-neutral-900">No users</h3>
            <p className="mt-1 text-sm text-neutral-500">Get started by adding a new user.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900">Roles & Permissions</h2>
      </div>

      {/* Role Selection */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <FiKey className="mr-2 text-primary-600" />
          Select Role
        </h3>

        <div className="mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Role</label>
            <select
              className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedRoleId}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>

          {selectedRoleId && (
            <div className="mt-4">
              <p className="text-sm text-neutral-600">
                <span className="font-medium">Description:</span>{' '}
                {roles.find((r) => r.id === selectedRoleId)?.description}
              </p>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="border-t border-neutral-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-neutral-900">Permissions</h4>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={handleSelectAllPermissions}>
                <FiEye className="mr-1" />
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={handleDeselectAllPermissions}>
                <FiEyeOff className="mr-1" />
                Deselect All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  id={`permission-${permission.id}`}
                  checked={rolePermissions.has(permission.id)}
                  onChange={() => handlePermissionToggle(permission.id)}
                  className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor={`permission-${permission.id}`} className="ml-3 flex flex-col">
                  <span className="text-sm font-medium text-neutral-900">{permission.key}</span>
                  <span className="text-xs text-neutral-500">{permission.description}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button onClick={handleSavePermissions}>
              <FiSave className="mr-2" />
              Save Permissions
            </Button>
          </div>
        </div>
      </div>

      {/* Roles Summary */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">All Roles</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`p-4 border rounded-lg ${
                selectedRoleId === role.id ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
              }`}
            >
              <h4 className="font-medium text-neutral-900">{role.name}</h4>
              <p className="text-sm text-neutral-600 mt-1">{role.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-neutral-500">
                  {users.filter((u) => u.roles.some((r) => r.id === role.id)).length} users
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedRoleId(role.id)}
                  className={selectedRoleId === role.id ? 'bg-primary-100' : ''}
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFQATab = () => (
    <div>
      <FAQManager data={data.organization.frequentlyAskedQuestions} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-medium">
        <nav className="flex flex-wrap border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-medium text-sm md:text-base flex items-center ${
              activeTab === 'general'
                ? 'text-primary-600 border-b-2 border-primary-600 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FiShoppingBag className="mr-2" />
            General
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium text-sm md:text-base flex items-center ${
              activeTab === 'users'
                ? 'text-primary-600 border-b-2 border-primary-600 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FiUsers className="mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-3 font-medium text-sm md:text-base flex items-center ${
              activeTab === 'roles'
                ? 'text-primary-600 border-b-2 border-primary-600 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FiKey className="mr-2" />
            Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab('fqa')}
            className={`px-6 py-3 font-medium text-sm md:text-base flex items-center ${
              activeTab === 'fqa'
                ? 'text-primary-600 border-b-2 border-primary-600 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FiKey className="mr-2" />
            FQA
          </button>
        </nav>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default SettingsPage;
