module.exports = {
  up: async (queryInterface:any) => {
    console.log('Creating extensions and trigram indexes...');

    // Enable extensions if not already enabled
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;`);

    try {
      await queryInterface.sequelize.query(`
        CREATE INDEX idx_products_name_trgm ON "Products" USING gin ((name) gin_trgm_ops);
      `);
      console.log('idx_products_name_trgm created');
    } catch (error) {
      console.log('idx_products_name_trgm already exists or error:', error);
    }

    try {
      await queryInterface.sequelize.query(`
        CREATE INDEX idx_products_sku_trgm ON "Products" USING gin ((sku) gin_trgm_ops);
      `);
      console.log('idx_products_sku_trgm created');
    } catch (error) {
      console.log('idx_products_sku_trgm already exists or error:', error);
    }

    try {
      await queryInterface.sequelize.query(`
        CREATE INDEX idx_products_description_trgm ON "Products" USING gin ((description) gin_trgm_ops);
      `);
      console.log('idx_products_description_trgm created');
    } catch (error) {
      console.log('idx_products_description_trgm already exists or error:', error);
    }

    console.log('Trigram indexes setup completed!');
  },

  down: async (queryInterface:any) => {
    console.log('Dropping trigram indexes...');

    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_products_name_trgm;`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_products_sku_trgm;`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_products_description_trgm;`);

    console.log('Trigram indexes dropped successfully!');
  }
};
