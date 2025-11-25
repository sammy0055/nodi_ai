// Types based on your schema
export interface Message {
  id: string;
  created_at: Date;
  content: string | null;
  role: 'user' | 'assistant' | 'system' | 'function';
  conversation_id: string;
}

export interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  preferences?: Record<string, any> | undefined;
  source: 'chatbot' | 'website' | 'mobile_app' | 'api';
  status: 'suspended' | 'active' | 'inactive';
  conversations: Conversation[];
  email?: string;
  createdAt?: Date;
  lastActive?: Date;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
