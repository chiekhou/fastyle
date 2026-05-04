'use strict';

module.exports = (sequelize, DataTypes) => {
  const Slot = sequelize.define(
    'Slot',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      period: {
        type: DataTypes.ENUM('morning', 'afternoon', 'evening'),
        allowNull: false,
      },
      service_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      is_blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      block_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'slots',
      underscored: true,
    }
  );

  // Méthode : vérifier si le créneau est disponible
  Slot.prototype.isAvailable = function () {
    return !this.is_blocked && !this.reservation;
  };

  return Slot;
};
