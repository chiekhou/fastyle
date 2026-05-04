'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      order_id: { type: DataTypes.UUID, allowNull: false },
      product_id: { type: DataTypes.UUID, allowNull: false },
      variant_id: { type: DataTypes.UUID, allowNull: true },
      quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() { return parseFloat(this.getDataValue('unit_price')); },
      },
      product_name_snapshot: { type: DataTypes.STRING(150), allowNull: false },
      variant_label_snapshot: { type: DataTypes.STRING(100), allowNull: true },
    },
    {
      tableName: 'order_items',
      underscored: true,
    }
  );

  return OrderItem;
};
