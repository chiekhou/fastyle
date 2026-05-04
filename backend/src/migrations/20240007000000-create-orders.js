'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id:               { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id:          { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      status:           { type: Sequelize.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
      paypal_order_id:  { type: Sequelize.STRING(100), allowNull: true, unique: true },
      paypal_capture_id:{ type: Sequelize.STRING(100), allowNull: true },
      total_price:      { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      shipping_address: { type: Sequelize.JSONB, allowNull: true },
      notes:            { type: Sequelize.TEXT, allowNull: true },
      created_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('orders', ['status']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('orders');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";');
  },
};
