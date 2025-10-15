import { DataTypes, Model, Optional, UUIDV4 } from 'sequelize';
import { sequelize } from './db';
import { ModelNames } from './model-names';
import { DbModels } from '.';

export interface AichatHistoryAttributes {
  id: string;
  conversation_id: string;
  chatContent: any[];
  tokenCount: number;
}

class AiChatHistoryModel extends Model implements AichatHistoryAttributes {
  public id!: string;
  public conversation_id!: string;
  public chatContent!: any[];
  public tokenCount!: number;

  static associate(models: DbModels) {
    this.belongsTo(models.Conversation, {
      foreignKey: 'conversation_id',
      as: 'conversation',
    });
  }
}

AiChatHistoryModel.init(
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
    chatContent: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false,
    },
    tokenCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  { sequelize, modelName: ModelNames.AiChatHistory, tableName: ModelNames.AiChatHistory }
);

export { AiChatHistoryModel };
