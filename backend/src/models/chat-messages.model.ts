// models/ChatMessage.ts
import { DataTypes, Model, Optional, UUIDV4 } from 'sequelize';
import { sequelize } from './db';
import { ModelNames } from './model-names';

interface ChatMessageAttributes {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool' | 'function';
  content: string | null;
  tool_calls?: any;
  tool_call_id?: string;
  tool_results?: any;
  tokens: number;
  message_index: number;
  is_compressed: boolean;
  compressed_from?: string[];
  created_at: Date;
}

interface ChatMessageCreationAttributes
  extends Optional<ChatMessageAttributes, 'id' | 'tokens' | 'is_compressed' | 'created_at'> {}

class ChatMessage extends Model<ChatMessageAttributes, ChatMessageCreationAttributes> implements ChatMessageAttributes {
  public id!: string;
  public conversation_id!: string;
  public role!: 'user' | 'assistant' | 'system' | 'function';
  public content!: string | null;
  public tool_calls?: any;
  public tool_call_id?: string;
  public tool_results?: any;
  public tokens!: number;
  public message_index!: number;
  public is_compressed!: boolean;
  public compressed_from?: string[];
  public created_at!: Date;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: ModelNames.Conversations,
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant', 'system', 'tool', 'function'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tool_calls: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    tool_call_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tool_results: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    tokens: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    message_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_compressed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    compressed_from: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: ModelNames.ChatMessage,
    tableName: ModelNames.ChatMessage,
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['conversation_id'],
      },
    ],
  }
);

export { ChatMessage };
