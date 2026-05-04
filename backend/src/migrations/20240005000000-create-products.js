'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id:                  { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name:                { type: Sequelize.STRING(150), allowNull: false },
      description:         { type: Sequelize.TEXT, allowNull: true },
      category:            { type: Sequelize.ENUM('cosmetic', 'clothing'), allowNull: false },
      price:               { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      stock_qty:           { type: Sequelize.INTEGER, defaultValue: 0 },
      low_stock_threshold: { type: Sequelize.INTEGER, defaultValue: 3 },
      image_url:           { type: Sequelize.STRING(500), allowNull: true },
      images_urls:         { type: Sequelize.ARRAY(Sequelize.STRING(500)), defaultValue: [] },
      has_variants:        { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active:           { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:          { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at:          { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('products', ['category']);
    await queryInterface.addIndex('products', ['is_active']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('products');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_products_category";');
  },
};
