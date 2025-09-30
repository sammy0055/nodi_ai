// db.ts
import { Sequelize, DataTypes } from 'sequelize';
import { appConfig } from '../config';

export const sequelize = new Sequelize(appConfig.db.url, {
  dialect: 'postgres',
  logging: false,
});

// Extend Sequelize DataTypes to support `vector`
(DataTypes as any).VECTOR = function (dim: number) {
  return `vector(${dim})`;
};