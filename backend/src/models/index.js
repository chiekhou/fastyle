'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

// Import des modèles
const User = require('./user')(sequelize, DataTypes);
const Service = require('./service')(sequelize, DataTypes);
const Slot = require('./slot')(sequelize, DataTypes);
const Reservation = require('./reservation')(sequelize, DataTypes);
const Product = require('./product')(sequelize, DataTypes);
const ProductVariant = require('./productVariant')(sequelize, DataTypes);
const Order = require('./order')(sequelize, DataTypes);
const OrderItem = require('./orderItem')(sequelize, DataTypes);
const Review = require('./review')(sequelize, DataTypes);
const RefreshToken = require('./refreshToken')(sequelize, DataTypes);

const db = {
  sequelize,
  Sequelize,
  User,
  Service,
  Slot,
  Reservation,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  Review,
  RefreshToken,
};

// Associations
// User
User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });

// Service
Service.hasMany(Reservation, { foreignKey: 'service_id', as: 'reservations' });
Service.hasMany(Slot, { foreignKey: 'service_id', as: 'slots' });

// Slot
Slot.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
Slot.hasOne(Reservation, { foreignKey: 'slot_id', as: 'reservation' });

// Reservation
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Reservation.belongsTo(Slot, { foreignKey: 'slot_id', as: 'slot' });
Reservation.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// Product
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

// ProductVariant
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'variant_id', as: 'orderItems' });

// Order
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

// OrderItem
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Review
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// RefreshToken
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = db;
