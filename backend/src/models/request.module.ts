import { sequelize } from './db';
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { OrganizationsModel } from './organizations.model';
import { UsersModel } from './users.model';
import { DbModels } from '.';
import { ModelNames } from './model-names';
import { RelatedEntityType, RequestStatus } from '../data/data-types';
import { BaseRequestAttributes, RequestAttributes } from '../types/notification';

class RequestModel
  extends Model<InferAttributes<RequestModel>, InferCreationAttributes<RequestModel>>
  implements BaseRequestAttributes
{
  declare id: string;
  declare organizationId: string;
  declare requesterUserId: string;
  declare title: string;
  declare description: string;
  declare status: `${RequestStatus}`;
  declare requestType: `${RelatedEntityType}`;
  declare data: any;
  declare approvedByUserId: string | null;
  declare approvedAt: Date | null;
  declare approvalNotes: string | null;
  declare rejectedAt: Date | null;

  static associate(models: DbModels) {
    this.belongsTo(models.OrganizationsModel, {
      foreignKey: 'organizationId',
      as: 'Organization',
    });

    this.belongsTo(models.UsersModel, {
      foreignKey: 'requesterUserId',
      as: 'requesterUser',
    });
  }
}

RequestModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: ModelNames.Organizations,
        key: 'id',
      },
      onUpdate: 'CASCADE', // Update notification if organization changes
      onDelete: 'SET NULL', // Keep notification if organization is deleted
    },
    requesterUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: ModelNames.Users,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Foreign key to User (who sent the notification)',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    status: {
      type: DataTypes.ENUM,
      values: [...Object.values(RequestStatus)],
      defaultValue: RequestStatus.PENDING,
    },
    requestType: {
      type: DataTypes.ENUM,
      values: [...Object.values(RelatedEntityType)],
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    approvedByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    approvalNotes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: ModelNames.Request,
    timestamps: true,
    indexes: [
      {
        fields: ['organizationId'],
      },
      {
        fields: ['requesterUserId'],
      },
    ],
  }
);

export { RequestModel };
