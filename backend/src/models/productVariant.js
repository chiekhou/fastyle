'use strict';

module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    'ProductVariant',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: { type: DataTypes.UUID, allowNull: false },
      label: { type: DataTypes.STRING(100), allowNull: false },
      stock_qty: { type: DataTypes.INTEGER, defaultValue: 0 },
      price_override: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        get() {
          const v = this.getDataValue('price_override');
          return v !== null ? parseFloat(v) : null;
        },
      },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'product_variants',
      underscored: true,
    }
  );

  return ProductVariant;
};
