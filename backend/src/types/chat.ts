// types/chat.ts
export interface OpenAIToolCall {
//   id: string;
  type: 'function_call';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenAIToolResult {
  type: 'function_call_output';
  call_id: string;
  output: string;
}

export type OpenAIRole = 'system' | 'user' | 'assistant' | 'tool' | 'function';

export interface OpenAIMessage {
  role: OpenAIRole;
  content: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ChatCompletionMessageParam {
  role: OpenAIRole;
  content: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface StoredMessage {
  id: string;
  role: OpenAIRole;
  content: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
  tool_results?: any;
  tokens: number;
  message_index: number;
  is_compressed: boolean;
  created_at?: Date;
}

export interface ConversationHistory {
  id: string;
  organization_id: string;
  title?: string;
  messages: StoredMessage[];
  created_at?: Date;
  updated_at?: Date;
}

export interface ConversationAttributes {
  id: string;
  organization_id: string;
  title?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}
