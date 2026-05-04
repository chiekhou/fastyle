'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'shipping_carrier', {
      type: Sequelize.ENUM('mondial_relay', 'colissimo'),
      allowNull: true,
    });
    await queryInterface.addColumn('orders', 'shipping_cost', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('orders', 'shipping_carrier');
    await queryInterface.removeColumn('orders', 'shipping_cost');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_shipping_carrier";');
  },
};
