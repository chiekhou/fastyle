'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id:         { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id:    { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      rating:     { type: Sequelize.SMALLINT, allowNull: false },
      comment:    { type: Sequelize.TEXT, allowNull: true },
      status:     { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      admin_note: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE reviews ADD CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5);'
    );
    await queryInterface.addIndex('reviews', ['user_id']);
    await queryInterface.addIndex('reviews', ['status']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('reviews');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reviews_status";');
  },
};
