'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'weight_grams', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 250,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('products', 'weight_grams');
  },
};
