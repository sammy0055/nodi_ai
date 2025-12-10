import React, { useEffect, useState } from 'react';
import {
  FiSearch,
  FiUser,
  FiPhone,
  FiMessageCircle,
  FiBox,
  FiMail,
  FiCalendar,
  FiGlobe,
  FiSmartphone,
  FiMessageSquare,
  FiShoppingBag,
  FiClock,
  FiArrowLeft,
  FiChevronDown,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useDebounce } from 'use-debounce';
import type { Conversation, Customer, Message, Pagination } from '../../types/customer';
import { useCustomersSetRecoilState, useCustomerValue } from '../../store/authAtoms';
import { useLoaderData } from 'react-router';
import { CustomerService } from '../../services/customerService';


// export const customerss: Customer[] = [
//   // ... your existing customer data remains the same
//   {
//     id: 'cust_001',
//     organizationId: 'org_001',
//     name: 'John Doe',
//     phone: '+2348012345678',
//     email: 'john@example.com',
//     source: 'chatbot',
//     status: 'active',
//     preferences: { language: 'en', productInterest: 'shoes' },
//     createdAt: new Date('2025-01-05T10:00:00Z'),
//     lastActive: new Date('2025-02-10T14:22:00Z'),
//     conversations: [
//       {
//         id: 'conv_001',
//         title: 'Order Inquiry',
//         messages: [
//           {
//             id: 'msg_001',
//             created_at: new Date('2025-02-10T14:00:00Z'),
//             content: 'Hi, I want to check my order status.',
//             role: 'user',
//             conversation_id: 'conv_001',
//           },
//           {
//             id: 'msg_002',
//             created_at: new Date('2025-02-10T14:01:00Z'),
//             content: 'Sure, can you share your order ID?',
//             role: 'assistant',
//             conversation_id: 'conv_001',
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: 'cust_006',
//     organizationId: 'org_003',
//     name: 'Kelvin Mark',
//     phone: '+2347019988776',
//     email: 'kelvin@example.com',
//     source: 'website',
//     status: 'active',
//     createdAt: new Date('2025-02-05T09:10:00Z'),
//     lastActive: new Date('2025-02-10T11:30:00Z'),
//     conversations: [],
//   },

//   {
//     id: 'cust_007',
//     organizationId: 'org_001',
//     name: 'Grace Ojo',
//     phone: '+2348034567890',
//     email: 'grace.ojo@example.com',
//     source: 'mobile_app',
//     status: 'inactive',
//     preferences: { notifications: false },
//     createdAt: new Date('2025-01-28T15:15:00Z'),
//     lastActive: new Date('2025-02-02T12:00:00Z'),
//     conversations: [],
//   },

//   {
//     id: 'cust_008',
//     organizationId: 'org_002',
//     name: 'Emmanuel Chike',
//     phone: '+2348094433221',
//     email: 'emma@example.com',
//     source: 'chatbot',
//     status: 'suspended',
//     createdAt: new Date('2025-02-01T10:45:00Z'),
//     lastActive: new Date('2025-02-01T10:45:00Z'),
//     conversations: [],
//   },

//   {
//     id: 'cust_009',
//     organizationId: 'org_004',
//     name: 'Rita Johnson',
//     phone: '+2348146677889',
//     source: 'api',
//     status: 'active',
//     email: 'rita.j@example.com',
//     preferences: { language: 'en', timezone: 'WAT' },
//     createdAt: new Date('2025-01-10T08:00:00Z'),
//     lastActive: new Date('2025-02-12T14:25:00Z'),
//     conversations: [],
//   },

//   {
//     id: 'cust_010',
//     organizationId: 'org_003',
//     name: 'David Ola',
//     phone: '+2348022334455',
//     source: 'website',
//     status: 'inactive',
//     createdAt: new Date('2025-02-12T13:00:00Z'),
//     lastActive: new Date('2025-02-14T09:30:00Z'),
//     conversations: [],
//   },

//   {
//     id: 'cust_011',
//     organizationId: 'org_002',
//     name: 'Blessing Amos',
//     phone: '+2348067788990',
//     source: 'chatbot',
//     status: 'active',
//     email: 'blessing@example.com',
//     createdAt: new Date('2025-01-25T11:00:00Z'),
//     lastActive: new Date('2025-02-10T16:45:00Z'),
//     conversations: [],
//   },

//   {
//     id: 'cust_012',
//     organizationId: 'org_001',
//     name: 'Hassan Bello',
//     phone: '+2348076543211',
//     source: 'mobile_app',
//     status: 'suspended',
//     preferences: { theme: 'light' },
//     createdAt: new Date('2025-01-14T09:20:00Z'),
//     lastActive: new Date('2025-01-14T09:20:00Z'),
//     conversations: [],
//   },

//   {
//     id: 'cust_013',
//     organizationId: 'org_004',
//     name: 'Mariam Sule',
//     phone: '+2348103344556',
//     source: 'api',
//     status: 'active',
//     email: 'mariam@example.com',
//     createdAt: new Date('2025-02-03T10:00:00Z'),
//     lastActive: new Date('2025-02-15T15:10:00Z'),
//     conversations: [],
//   },

//   {
//     id: 'cust_014',
//     organizationId: 'org_002',
//     name: 'Patrick Ndu',
//     phone: '+2348129988776',
//     source: 'website',
//     status: 'inactive',
//     createdAt: new Date('2025-01-18T08:40:00Z'),
//     lastActive: new Date('2025-01-22T10:00:00Z'),
//     conversations: [],
//   },

//   {
//     id: 'cust_015',
//     organizationId: 'org_003',
//     name: 'Linda Okafor',
//     phone: '+2348026655443',
//     source: 'chatbot',
//     status: 'active',
//     email: 'linda@example.com',
//     preferences: { preferredContact: 'whatsapp' },
//     createdAt: new Date('2025-02-11T14:00:00Z'),
//     lastActive: new Date('2025-02-12T08:30:00Z'),
//     conversations: [],
//   },
//   // ... rest of your customer data
// ];

const CustomersPage: React.FC = () => {
  const data = useLoaderData() as { customers: { data: { data: Customer[]; pagination: Pagination } } };
  const customers = useCustomerValue();
  const setCustomers = useCustomersSetRecoilState();
  const [pagination, setPagination] = useState<Pagination>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'conversations'>('details');
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // initial data loading
  useEffect(() => {
    if (data) {
      setCustomers(data?.customers?.data?.data);
      setPagination(data?.customers?.data?.pagination);
    }
  }, [data]);

  const { getAllCustomers, updateCustomerStatus } = new CustomerService();
  // Filter customers when search term changes
  useEffect(() => {
    const Fn = async () => {
      const data = await getAllCustomers(1, searchTerm);
      setCustomers(data.data.data);
      setPagination(data?.data?.pagination);
    };
    if (debouncedSearchTerm) Fn();
  }, [debouncedSearchTerm]);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'website':
        return <FiGlobe className="text-blue-500" size={14} />;
      case 'mobile_app':
        return <FiSmartphone className="text-green-500" size={14} />;
      case 'chatbot':
        return <FiMessageSquare className="text-purple-500" size={14} />;
      case 'api':
        return <FiShoppingBag className="text-orange-500" size={14} />;
      default:
        return <FiUser className="text-gray-500" size={14} />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'website':
        return 'bg-blue-100 text-blue-800';
      case 'mobile_app':
        return 'bg-green-100 text-green-800';
      case 'chatbot':
        return 'bg-purple-100 text-purple-800';
      case 'api':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedConversation(null);
    setActiveTab('details');
    if (window.innerWidth < 768) {
      setIsMobileDetailView(true);
    }
  };

  const handleBackToList = () => {
    setIsMobileDetailView(false);
    setSelectedCustomer(null);
    setSelectedConversation(null);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setActiveTab('conversations');
  };

  const handlePagination = async (page: number) => {
    try {
      const data = await getAllCustomers(page);
      setCustomers((prev) => [...prev, ...data.data.data]);
      setPagination(data.data.pagination);
    } catch (error: any) {
      alert('something went wrong, pls try again');
    }
  };

  // Improved Chat Message Component with proper left/right alignment
  const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-primary-500' : 'bg-neutral-300'
            }`}
          >
            {isUser ? <FiUser className="text-white text-sm" /> : <FiMessageSquare className="text-white text-sm" />}
          </div>

          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div
              className={`rounded-2xl px-4 py-3 ${
                isUser
                  ? 'bg-primary-100 text-primary-900 rounded-br-md border border-primary-200'
                  : 'bg-white text-neutral-800 border-neutral-200 shadow-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>

            {/* Timestamp */}
            <div className="flex items-center mt-1 text-xs text-neutral-500">
              <FiClock className="mr-1" size={10} />
              {formatTime(message.created_at)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Compact Customer Card Component
  const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => (
    <div
      className={`p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer ${
        selectedCustomer?.id === customer.id ? 'border-primary-500 bg-primary-50 shadow-sm' : 'bg-white'
      }`}
      onClick={() => handleSelectCustomer(customer)}
    >
      <div className="flex items-start space-x-3">
        {/* Customer Avatar */}
        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <FiUser className="text-primary-600 text-lg" />
        </div>

        {/* Customer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-neutral-900 truncate text-sm">{customer.name}</h3>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getSourceColor(customer.source)}`}
            >
              {getSourceIcon(customer.source)}
            </span>
          </div>

          <div className="space-y-1 text-xs text-neutral-600">
            <div className="flex items-center">
              <FiPhone className="mr-2" size={12} />
              <span className="truncate">{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center">
                <FiMail className="mr-2" size={12} />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
            <div className="flex items-center">
              <FiMessageCircle className="mr-1" size={12} />
              <span>{customer.conversations.length} conv</span>
            </div>
            <div>{customer.lastActive ? formatDate(customer.lastActive) : 'Never'}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleStatusChange = async (id: string, status: 'suspended' | 'active' | 'inactive') => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status } // create a new object
          : c
      )
    );
    setSelectedCustomer((prev) => ({ ...prev!, status: status }));
    try {
      await updateCustomerStatus({ status, id });
    } catch (error) {
      alert('failed to change customer status');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white">
      {/* Customer List - Always visible on desktop, conditional on mobile */}
      <div
        className={`${
          isMobileDetailView ? 'hidden' : 'flex'
        } lg:flex flex-col w-full lg:w-80 xl:w-96 border-r border-neutral-200 h-full`}
      >
        {/* Header - Fixed */}
        <div className="p-4 border-b border-neutral-200 bg-white flex-shrink-0">
          <div className="flex flex-col space-y-3">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Customers</h2>
              <p className="text-neutral-600 text-xs">Manage customer interactions</p>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-neutral-400" size={16} />
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Customer List - Scrollable area with fixed height */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-3">
                {customers?.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <FiBox className="mx-auto text-3xl text-neutral-300 mb-2" />
                    <p className="text-sm">No customers found</p>
                    {searchTerm && (
                      <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2 text-xs">
                        Clear search
                      </Button>
                    )}
                  </div>
                ) : (
                  customers?.map((customer) => <CustomerCard key={customer.id} customer={customer} />)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination - Fixed */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200 bg-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePagination(pagination.currentPage + 1)}
                  className="px-2"
                >
                  load more
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details & Conversations */}
      <div className={`flex-1 ${isMobileDetailView ? 'flex' : 'hidden'} lg:flex flex-col min-h-0`}>
        {selectedCustomer ? (
          <>
            {/* Mobile Back Button */}
            <div className="lg:hidden p-4 border-b border-neutral-200 bg-white flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleBackToList} className="flex items-center">
                <FiArrowLeft className="mr-2" />
                Back to Customers
              </Button>
            </div>

            {/* Customer Header */}
            <div className="p-6 border-b border-neutral-200 bg-white flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* Customer Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-primary-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                      <h2 className="text-xl font-bold text-neutral-900">{selectedCustomer.name}</h2>
                      {/* Status Badge with Dropdown */}
                      <div className="relative">
                        <select
                          value={selectedCustomer.status}
                          onChange={(e) =>
                            handleStatusChange(
                              selectedCustomer.id,
                              e.target.value as 'suspended' | 'active' | 'inactive'
                            )
                          }
                          className={`appearance-none px-3 py-1 rounded-full text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${
                            selectedCustomer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : selectedCustomer.status === 'suspended'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="active" className="bg-white text-green-800">
                            Active
                          </option>
                          <option value="suspended" className="bg-white text-yellow-800">
                            Suspend
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          <FiChevronDown className="text-current" size={14} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-neutral-600 mt-1">
                      <div className="flex items-center">
                        <FiPhone className="mr-1" size={14} />
                        {selectedCustomer.phone}
                      </div>
                      <div className="flex items-center">
                        <FiMail className="mr-1" size={14} />
                        {selectedCustomer.email}
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" size={14} />
                        Joined {formatDate(selectedCustomer.createdAt!)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Source Badge */}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSourceColor(
                    selectedCustomer.source
                  )}`}
                >
                  {getSourceIcon(selectedCustomer.source)}
                  <span className="ml-1 hidden sm:inline">
                    {selectedCustomer.source
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </span>
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-neutral-200 bg-white flex-shrink-0">
              <div className="px-6">
                <div className="flex space-x-6">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-3 border-b-2 font-medium text-sm ${
                      activeTab === 'details'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('conversations')}
                    className={`py-3 border-b-2 font-medium text-sm ${
                      activeTab === 'conversations'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    Conversations ({selectedCustomer.conversations.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content - Scrollable */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto bg-neutral-50">
                {activeTab === 'details' && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="bg-white rounded-lg border border-neutral-200 p-6">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Customer Information</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <label className="text-neutral-600">Customer ID</label>
                              <p className="font-medium mt-1">{selectedCustomer.id}</p>
                            </div>
                            <div>
                              <label className="text-neutral-600">Source</label>
                              <p className="font-medium mt-1 capitalize">{selectedCustomer.source.replace('_', ' ')}</p>
                            </div>
                            <div>
                              <label className="text-neutral-600">Status</label>
                              <p className="font-medium mt-1 capitalize">{selectedCustomer.status.replace('_', ' ')}</p>
                            </div>
                            <div>
                              <label className="text-neutral-600">Phone</label>
                              <p className="font-medium mt-1">{selectedCustomer.phone}</p>
                            </div>
                            <div>
                              <label className="text-neutral-600">Email</label>
                              <p className="font-medium mt-1">{selectedCustomer.email}</p>
                            </div>
                            <div>
                              <label className="text-neutral-600">Member Since</label>
                              <p className="font-medium mt-1">{formatDate(selectedCustomer.createdAt!)}</p>
                            </div>
                            <div>
                              <label className="text-neutral-600">Last Active</label>
                              <p className="font-medium mt-1">
                                {selectedCustomer.lastActive ? formatDate(selectedCustomer.lastActive) : 'Never'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Conversation Summary */}
                      <div className="bg-white rounded-lg border border-neutral-200 p-6">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Conversation Summary</h3>
                        <div className="space-y-4">
                          <div className="bg-primary-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-primary-900">Total Conversations</span>
                              <span className="text-2xl font-bold text-primary-600">
                                {selectedCustomer.conversations.length}
                              </span>
                            </div>
                            <p className="text-sm text-primary-700 mt-1">
                              {selectedCustomer.conversations.reduce((total, conv) => total + conv.messages.length, 0)}{' '}
                              total messages
                            </p>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-neutral-900">Recent Conversations</h4>
                            {selectedCustomer.conversations.slice(0, 3).map((conversation) => (
                              <div
                                key={conversation.id}
                                className="p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                                onClick={() => handleSelectConversation(conversation)}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className="font-medium text-neutral-900 text-sm truncate flex-1 mr-2">
                                    {conversation.title || 'Untitled Conversation'}
                                  </h5>
                                  <span className="text-xs text-neutral-500 whitespace-nowrap">
                                    {conversation.messages.length} msg
                                  </span>
                                </div>
                                {conversation.messages[0] && (
                                  <p className="text-xs text-neutral-600 truncate">
                                    {conversation.messages[0].content}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Preferences */}
                      {selectedCustomer.preferences && Object.keys(selectedCustomer.preferences).length > 0 && (
                        <div className="bg-white rounded-lg border border-neutral-200 p-6 xl:col-span-2">
                          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Preferences</h3>
                          <div className="bg-neutral-50 rounded-lg p-4">
                            <pre className="text-sm text-neutral-700 whitespace-pre-wrap">
                              {JSON.stringify(selectedCustomer.preferences, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'conversations' && (
                  <div className="flex flex-col h-full">
                    {/* Conversation List */}
                    <div className="bg-white border-b border-neutral-200 p-4 flex-shrink-0">
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {selectedCustomer.conversations.map((conversation) => (
                          <button
                            key={conversation.id}
                            onClick={() => handleSelectConversation(conversation)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                              selectedConversation?.id === conversation.id
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="truncate max-w-32">{conversation.title || 'Untitled'}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs ${
                                  selectedConversation?.id === conversation.id
                                    ? 'bg-white text-primary-600'
                                    : 'bg-neutral-100 text-neutral-600'
                                }`}
                              >
                                {conversation.messages.length}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-hidden">
                      {selectedConversation ? (
                        <>
                          {/* Chat Header */}
                          <div className="bg-white border-b border-neutral-200 p-4 flex-shrink-0">
                            <div>
                              <h3 className="font-semibold text-neutral-900 text-sm">
                                {selectedConversation.title || 'Untitled Conversation'}
                              </h3>
                              <p className="text-xs text-neutral-500 mt-1">
                                {selectedConversation.messages.length} messages •{' '}
                                {formatDate(selectedConversation.messages[0]?.created_at || new Date())}
                              </p>
                            </div>
                          </div>

                          {/* Messages */}
                          <div className="h-full overflow-auto p-4">
                            <div className="max-w-4xl mx-auto">
                              {selectedConversation.messages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-neutral-500">
                          <div className="text-center">
                            <FiMessageCircle className="mx-auto text-3xl text-neutral-300 mb-2" />
                            <p className="text-sm">Select a conversation to view messages</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <FiUser className="mx-auto text-4xl text-neutral-300 mb-3" />
              <p>Select a customer to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
