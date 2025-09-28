// db.ts
import { Sequelize } from 'sequelize';
import { appConfig } from '../config';

export const sequelize = new Sequelize(appConfig.db.url, {
  dialect: 'postgres',
  logging: false,
});
