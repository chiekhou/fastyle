'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id:          { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id:     { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      token_hash:  { type: Sequelize.STRING(255), allowNull: false, unique: true },
      expires_at:  { type: Sequelize.DATE, allowNull: false },
      is_revoked:  { type: Sequelize.BOOLEAN, defaultValue: false },
      device_info: { type: Sequelize.STRING(255), allowNull: true },
      created_at:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('refresh_tokens', ['user_id']);
    await queryInterface.addIndex('refresh_tokens', ['token_hash']);
    await queryInterface.addIndex('refresh_tokens', ['expires_at']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  },
};
