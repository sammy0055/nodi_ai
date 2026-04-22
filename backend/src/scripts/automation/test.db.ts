// // db.ts
// import { Sequelize, DataTypes } from 'sequelize';

// export const sequelize = new Sequelize("postgres://postgres:sammy0055@104.219.250.180:4010/nodi_ai", {
//   dialect: 'postgres',
//   logging: false,
// });

// // Extend Sequelize DataTypes to support `vector`
// (DataTypes as any).VECTOR = function (dim: number) {
//   return `vector(${dim})`;
// };