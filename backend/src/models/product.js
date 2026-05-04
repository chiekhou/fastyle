'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      category: {
        type: DataTypes.ENUM('cosmetic', 'clothing'),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() { return parseFloat(this.getDataValue('price')); },
      },
      stock_qty: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      low_stock_threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
      },
      image_url: { type: DataTypes.STRING(500), allowNull: true },
      images_urls: {
        type: DataTypes.ARRAY(DataTypes.STRING(500)),
        defaultValue: [],
      },
      has_variants: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      weight_grams: {
        type: DataTypes.INTEGER,
        defaultValue: 250,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'products',
      underscored: true,
    }
  );

  // Méthode : stock bas ?
  Product.prototype.isLowStock = function () {
    return this.stock_qty <= this.low_stock_threshold;
  };

  return Product;
};
