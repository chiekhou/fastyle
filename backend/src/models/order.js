'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
      },
      paypal_order_id: { type: DataTypes.STRING(100), allowNull: true },
      paypal_capture_id: { type: DataTypes.STRING(100), allowNull: true },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() { return parseFloat(this.getDataValue('total_price')); },
      },
      shipping_address: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      shipping_carrier: {
        type: DataTypes.ENUM('mondial_relay', 'colissimo'),
        allowNull: true,
      },
      shipping_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        get() { return parseFloat(this.getDataValue('shipping_cost') || 0); },
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'orders',
      underscored: true,
    }
  );

  return Order;
};
