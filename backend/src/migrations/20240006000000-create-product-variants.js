'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_variants', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      product_id:     { type: Sequelize.UUID, allowNull: false, references: { model: 'products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      label:          { type: Sequelize.STRING(100), allowNull: false },
      stock_qty:      { type: Sequelize.INTEGER, defaultValue: 0 },
      price_override: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      is_active:      { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addConstraint('product_variants', {
      fields: ['product_id', 'label'],
      type: 'unique',
      name: 'unique_variant_label_per_product',
    });
    await queryInterface.addIndex('product_variants', ['product_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('product_variants');
  },
};
