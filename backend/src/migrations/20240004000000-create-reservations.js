'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reservations', {
      id:                       { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id:                  { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      slot_id:                  { type: Sequelize.UUID, allowNull: false, references: { model: 'slots', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      service_id:               { type: Sequelize.UUID, allowNull: false, references: { model: 'services', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      total_price:              { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      deposit_amount:           { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      deposit_status:           { type: Sequelize.ENUM('pending', 'paid', 'refunded'), defaultValue: 'pending' },
      deposit_paypal_order_id:  { type: Sequelize.STRING(100), allowNull: true, unique: true },
      deposit_paypal_capture_id:{ type: Sequelize.STRING(100), allowNull: true },
      status:                   { type: Sequelize.ENUM('pending', 'confirmed', 'cancelled', 'completed'), defaultValue: 'pending' },
      cancellation_reason:      { type: Sequelize.STRING(500), allowNull: true },
      notes:                    { type: Sequelize.TEXT, allowNull: true },
      reservation_date:         { type: Sequelize.DATEONLY, allowNull: false },
      created_at:               { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at:               { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('reservations', ['user_id']);
    await queryInterface.addIndex('reservations', ['slot_id']);
    await queryInterface.addIndex('reservations', ['status']);
    await queryInterface.addIndex('reservations', ['reservation_date']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('reservations');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reservations_deposit_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reservations_status";');
  },
};
