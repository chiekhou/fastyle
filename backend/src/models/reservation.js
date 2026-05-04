'use strict';

module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define(
    'Reservation',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      slot_id: { type: DataTypes.UUID, allowNull: false },
      service_id: { type: DataTypes.UUID, allowNull: false },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() { return parseFloat(this.getDataValue('total_price')); },
      },
      deposit_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() { return parseFloat(this.getDataValue('deposit_amount')); },
      },
      deposit_status: {
        type: DataTypes.ENUM('pending', 'paid', 'refunded'),
        defaultValue: 'pending',
      },
      deposit_paypal_order_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      deposit_paypal_capture_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        defaultValue: 'pending',
      },
      cancellation_reason: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reservation_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: 'reservations',
      underscored: true,
    }
  );

  return Reservation;
};
