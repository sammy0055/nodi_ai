// models/ChatMessage.ts
import { DataTypes, Model, Optional, UUIDV4 } from 'sequelize';
import { sequelize } from './db';
import { ModelNames } from './model-names';
import { DbModels } from '.';

interface ChatMessageAttributes {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool' | 'function';
  content: string | null;
  token: number;
  message_index: number;
  created_at: Date;
}

interface ChatMessageCreationAttributes extends Optional<ChatMessageAttributes, 'id' | 'token' | 'created_at'> {}
class ChatMessage extends Model<ChatMessageAttributes, ChatMessageCreationAttributes> implements ChatMessageAttributes {
  public id!: string;
  public conversation_id!: string;
  public role!: 'user' | 'assistant' | 'system' | 'function';
  public content!: string | null;
  public token!: number;
  public message_index!: number;
  public is_compressed!: boolean;
  public created_at!: Date;

  static associate(models: DbModels) {
    this.belongsTo(models.Conversation, {
      foreignKey: 'conversation_id',
      as: 'conversations',
    });
  }
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
    token: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    message_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
