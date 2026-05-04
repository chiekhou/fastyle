'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id:                      { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      order_id:                { type: Sequelize.UUID, allowNull: false, references: { model: 'orders', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      product_id:              { type: Sequelize.UUID, allowNull: false, references: { model: 'products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      variant_id:              { type: Sequelize.UUID, allowNull: true,  references: { model: 'product_variants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      quantity:                { type: Sequelize.INTEGER, defaultValue: 1 },
      unit_price:              { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      product_name_snapshot:   { type: Sequelize.STRING(150), allowNull: false },
      variant_label_snapshot:  { type: Sequelize.STRING(100), allowNull: true },
      created_at:              { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at:              { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('order_items', ['order_id']);
    await queryInterface.addIndex('order_items', ['product_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('order_items');
  },
};
