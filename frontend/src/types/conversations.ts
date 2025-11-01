export interface ConversationAttributes {
  id: string;
  organizationId: string;
  customerId: string;
  title?: string;
  tokenCount?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  messages: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string | null;
  token: number;
  message_index: number;
  created_at: Date;
}
