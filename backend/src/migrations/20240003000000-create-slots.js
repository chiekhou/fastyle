'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('slots', {
      id:           { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      date:         { type: Sequelize.DATEONLY, allowNull: false },
      period:       { type: Sequelize.ENUM('morning', 'afternoon', 'evening'), allowNull: false },
      service_id:   {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'services', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      is_blocked:   { type: Sequelize.BOOLEAN, defaultValue: false },
      block_reason: { type: Sequelize.STRING(255), allowNull: true },
      created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addConstraint('slots', {
      fields: ['date', 'period'],
      type: 'unique',
      name: 'unique_slot_date_period',
    });
    await queryInterface.addIndex('slots', ['date']);
    await queryInterface.addIndex('slots', ['is_blocked']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('slots');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_slots_period";');
  },
};
