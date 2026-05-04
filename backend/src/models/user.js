'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('client', 'admin'),
        defaultValue: 'client',
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      email_verification_token: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: 'users',
      underscored: true,
      // Ne jamais retourner le hash ni le token dans les requêtes
      defaultScope: {
        attributes: { exclude: ['password_hash', 'email_verification_token'] },
      },
      scopes: {
        withPassword: { attributes: {} },
      },
    }
  );

  // Méthodes d'instance
  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  // Hook : hasher le mot de passe avant création/update
  User.beforeCreate(async (user) => {
    if (user.password_hash) {
      user.password_hash = await bcrypt.hash(user.password_hash, 12);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password_hash')) {
      user.password_hash = await bcrypt.hash(user.password_hash, 12);
    }
  });

  return User;
};
