import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiChevronDown, FiMessageCircle, FiUser, FiZap, FiClock, FiBox, FiRefreshCw } from 'react-icons/fi';
import { useDebounce } from 'use-debounce';
import { AdminOrganziationService } from '../../services/admin/AdminOrganizationService';
import { useLoaderData } from 'react-router';
import type { Pagination } from '../../types/customer';
import type { ConversationAttributes, Message } from '../../types/conversations';
import { useClickOutside } from '../../hooks/clickOutside';

// Types based on your schema
interface Organization {
  id: string;
  name: string;
}

const ConversationLogsPage: React.FC = () => {
  const data = useLoaderData() as { data: Organization[]; pagination: Pagination };
  // Organization states
  const [organizations, setOrganizations] = useState<Organization[]>(data.data || []);
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>(data.pagination);

  // Conversation states
  const [conversations, setConversations] = useState<ConversationAttributes[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationAttributes | null>(null);
  const [convLoading, setConvLoading] = useState(false);
  const [convPagination, setConvpagination] = useState<Pagination>();

  // Refs for infinite scroll
  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const conversationListRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { adminGetPaginatedOrganizations, adminGetConversationsByOrgId } = new AdminOrganziationService();
  const [debouncedOrgSearch] = useDebounce(organizationSearch, 500);

  // Load organizations
  const loadOrganizations = useCallback(async (page: number = 1, search: string = '', append: boolean = false) => {
    setOrgLoading(true);
    try {
      const response = await adminGetPaginatedOrganizations({ page, searchTerm: search });
      if (append) {
        setOrganizations((prev) => [...prev, ...response.data.data]);
      } else {
        setOrganizations(response.data.data);
      }
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setOrgLoading(false);
    }
  }, []);

  // Load conversations
  const loadConversations = useCallback(async (orgId: string, page: number = 1, append: boolean = false) => {
    if (!orgId) return;

    setConvLoading(true);
    try {
      const response = await adminGetConversationsByOrgId({ page, organizationId: orgId });
      if (append) {
        setConversations((prev) => [...prev, ...response.data.data]);
      } else {
        setConversations(response.data.data);
        setSelectedConversation(response.data.data[0] || null);
      }
      setConvpagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setConvLoading(false);
    }
  }, []);

  // Load initial organizations
  useEffect(() => {
    loadOrganizations(1, '');
  }, [loadOrganizations]);

  // Handle organization search
  useEffect(() => {
    if (debouncedOrgSearch !== undefined) {
      loadOrganizations(1, debouncedOrgSearch, false);
    }
  }, [debouncedOrgSearch, loadOrganizations]);

  // Handle organization selection
  useEffect(() => {
    if (selectedOrganization) {
      setConversations([]);
      setSelectedConversation(null);
      loadConversations(selectedOrganization.id, 1, false);
      setShowOrgDropdown(false);
    }
  }, [selectedOrganization, loadConversations]);

  // handle organization click outside effect
  const closeDropdownOnClickOutsit = () => setShowOrgDropdown(false);
  useClickOutside(orgDropdownRef, closeDropdownOnClickOutsit);

  // Infinite scroll for organizations
  const handleOrgScroll = useCallback(() => {
    if (!orgDropdownRef.current || orgLoading || !pagination.hasNextPage) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = orgDropdownRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      const orgPage = pagination?.currentPage ? pagination?.currentPage + 1 : 1;
      loadOrganizations(orgPage, organizationSearch, true);
    }
  }, [orgLoading, pagination, pagination.currentPage, organizationSearch, loadOrganizations]);

  // Infinite scroll for conversations
  const handleConvScroll = useCallback(() => {
    if (!conversationListRef.current || convLoading || !convPagination?.hasNextPage || !selectedOrganization) return;

    const { scrollTop, scrollHeight, clientHeight } = conversationListRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      const convPage = convPagination?.currentPage ? convPagination.currentPage + 1 : 1;
      loadConversations(selectedOrganization.id, convPage + 1, true);
    }
  }, [convLoading, convPagination, selectedOrganization, loadConversations]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Chat Message Component
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
            {isUser ? <FiUser className="text-white text-sm" /> : <FiMessageCircle className="text-white text-sm" />}
          </div>

          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div
              className={`rounded-2xl px-4 py-3 ${
                isUser
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-md shadow-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>

            {/* Timestamp and Token Count */}
            <div className="flex items-center mt-1 text-xs text-neutral-500 space-x-2">
              <FiClock size={10} />
              <span>{formatTime(message.created_at)}</span>
              <span>•</span>
              <div className="flex items-center">
                <FiZap size={10} className="mr-1" />
                <span>{message.token} tokens</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Conversation List Item Component
  const ConversationItem: React.FC<{ conversation: ConversationAttributes }> = ({ conversation }) => (
    <div
      className={`p-4 border-b border-neutral-200 cursor-pointer transition-colors ${
        selectedConversation?.id === conversation.id ? 'bg-primary-50 border-primary-200' : 'hover:bg-neutral-50'
      }`}
      onClick={() => setSelectedConversation(conversation)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-neutral-900 text-sm line-clamp-1 flex-1 mr-2">
          {conversation.title || `Conversation ${conversation.id}`}
        </h4>
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            conversation.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {conversation.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
        <span>{conversation.messages.length} messages</span>
        <div className="flex items-center">
          <FiZap className="mr-1" size={10} />
          <span>{conversation.tokenCount} tokens</span>
        </div>
      </div>

      <div className="text-xs text-neutral-500">{formatDate(conversation.created_at)}</div>

      {conversation.messages[0] && (
        <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{conversation.messages[0].content}</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white overflow-hidden">
      {/* Left Sidebar - Organization Selector & Conversations */}
      <div className="lg:w-96 flex flex-col border-r border-neutral-200 h-full">
        {/* Organization Selector - Fixed Height */}
        <div className="p-4 border-b border-neutral-200 flex-shrink-0">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">Conversation Logs</h2>

            {/* Organization Dropdown */}
            <div className="relative">
              <label className="text-sm font-medium text-neutral-700 mb-2 block">Select Organization</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search organizations by name or ID..."
                  className="w-full pl-4 pr-10 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={organizationSearch}
                  onChange={(e) => setOrganizationSearch(e.target.value)}
                  onFocus={() => setShowOrgDropdown(true)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <FiChevronDown className="text-neutral-400" />
                </div>
              </div>

              {/* Organization Dropdown Menu */}
              {showOrgDropdown && (
                <div
                  ref={orgDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  onScroll={handleOrgScroll}
                >
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className={`px-4 py-3 hover:bg-neutral-100 cursor-pointer border-b border-neutral-200 last:border-b-0 ${
                        selectedOrganization?.id === org.id ? 'bg-primary-50 border-primary-200' : ''
                      }`}
                      onClick={() => setSelectedOrganization(org)}
                    >
                      <div className="font-medium text-neutral-900">{org.name}</div>
                      <div className="text-sm text-neutral-500">{org.id}</div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {orgLoading && (
                    <div className="px-4 py-3 text-center text-neutral-500">
                      <FiRefreshCw className="animate-spin inline mr-2" />
                      Loading more organizations...
                    </div>
                  )}

                  {/* No results */}
                  {organizations.length === 0 && !orgLoading && (
                    <div className="px-4 py-3 text-center text-neutral-500">No organizations found</div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Organization Info */}
            {selectedOrganization && (
              <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
                <div className="font-medium text-primary-900">{selectedOrganization.name}</div>
                <div className="text-sm text-primary-700">ID: {selectedOrganization.id}</div>
              </div>
            )}
          </div>
        </div>

        {/* Conversations List - Scrollable Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {' '}
          {/* min-h-0 is crucial for flex children to scroll */}
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex-shrink-0">
            <h3 className="font-semibold text-neutral-900">
              Conversations {selectedOrganization && `(${conversations.length})`}
            </h3>
          </div>
          {/* Scrollable Conversations Container */}
          <div
            ref={conversationListRef}
            className="flex-1 overflow-y-auto" // This creates the independent scrollbar
            onScroll={handleConvScroll}
          >
            {!selectedOrganization ? (
              <div className="p-8 text-center text-neutral-500">
                <FiMessageCircle className="mx-auto text-3xl text-neutral-300 mb-3" />
                <p>Select an organization to view conversations</p>
              </div>
            ) : conversations.length === 0 && !convLoading ? (
              <div className="p-8 text-center text-neutral-500">
                <FiBox className="mx-auto text-3xl text-neutral-300 mb-3" />
                <p>No conversations found for this organization</p>
              </div>
            ) : (
              <>
                {conversations.map((conversation) => (
                  <ConversationItem key={conversation.id} conversation={conversation} />
                ))}

                {/* Loading indicator */}
                {convLoading && (
                  <div className="p-4 text-center text-neutral-500">
                    <FiRefreshCw className="animate-spin inline mr-2" />
                    Loading more conversations...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Messages - Static with independent scrollbar */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        {selectedConversation ? (
          <>
            {/* Conversation Header - Fixed */}
            <div className="p-4 border-b border-neutral-200 bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">
                    {selectedConversation.title || `Conversation ${selectedConversation.id}`}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {selectedConversation.messages.length} messages • {formatDate(selectedConversation.created_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-neutral-600">
                  <div className="flex items-center">
                    <FiZap className="mr-1" size={12} />
                    <span>{selectedConversation.tokenCount} total tokens</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      selectedConversation.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedConversation.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Container - Scrollable Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto bg-neutral-50 min-h-0" // Independent scrollbar
            >
              <div className="p-4 max-w-4xl mx-auto">
                {selectedConversation.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500 min-h-0">
            <div className="text-center">
              <FiMessageCircle className="mx-auto text-4xl text-neutral-300 mb-3" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationLogsPage;
