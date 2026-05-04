'use strict';

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      token_hash: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      is_revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
      device_info: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      tableName: 'refresh_tokens',
      underscored: true,
    }
  );

  RefreshToken.prototype.isExpired = function () {
    return new Date() > this.expires_at;
  };

  RefreshToken.prototype.isValid = function () {
    return !this.is_revoked && !this.isExpired();
  };

  return RefreshToken;
};
