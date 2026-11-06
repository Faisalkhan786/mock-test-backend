"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("test_questions", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      testId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      questionId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      // `order` is a reserved SQL word — sequelize quotes it automatically.
      order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("test_questions", ["testId"]);
    await queryInterface.addIndex("test_questions", ["testId", "questionId"], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("test_questions");
  },
};
