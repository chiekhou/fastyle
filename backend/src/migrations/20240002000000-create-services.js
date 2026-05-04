'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      id:               { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name:             { type: Sequelize.STRING(150), allowNull: false },
      description:      { type: Sequelize.TEXT, allowNull: true },
      duration_minutes: { type: Sequelize.INTEGER, allowNull: false },
      price:            { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      image_url:        { type: Sequelize.STRING(500), allowNull: true },
      is_active:        { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('services', ['is_active']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('services');
  },
};
