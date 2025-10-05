// models/Conversation.ts
import { DataTypes, Model, Optional, UUIDV4 } from 'sequelize';
import { sequelize } from './db';
// import { DbModels } from '.';
import { ModelNames } from './model-names';

interface ConversationAttributes {
  id: string;
  organizationId: string;
  customerId: string;
  title?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  public id!: string;
  public organizationId!: string;
  public customerId!: string;
  public title?: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Organizations,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ModelNames.Customers,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: ModelNames.Conversations,
    tableName: ModelNames.Conversations,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['customerId'],
      },
      {
        fields: ['organizationId'],
      },
    ],
  }
);

export { Conversation };
