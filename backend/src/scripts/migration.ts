import { sequelize } from '../models/db';

// run after creating db for the first time to make vector search very efficient
const vectorFn = async () => {
  await sequelize.query('ALTER INDEX product_embedding_idx SET (lists = 100);');
  await sequelize.query('ANALYZE Products;');
};

vectorFn();
