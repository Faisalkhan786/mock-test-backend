"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("questions", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      questionHi: { type: Sequelize.TEXT, allowNull: false },
      questionEn: { type: Sequelize.TEXT, allowNull: false },
      optionsHi: { type: Sequelize.JSON, allowNull: false },
      optionsEn: { type: Sequelize.JSON, allowNull: false },
      correctIndex: { type: Sequelize.TINYINT, allowNull: false },
      solutionHi: { type: Sequelize.TEXT, allowNull: true },
      solutionEn: { type: Sequelize.TEXT, allowNull: true },
      subject: { type: Sequelize.STRING(50), allowNull: false },
      chapter: { type: Sequelize.STRING(80), allowNull: true },
      difficulty: { type: Sequelize.ENUM("easy", "medium", "hard"), defaultValue: "medium" },
      classLevel: { type: Sequelize.TINYINT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("questions", ["classLevel", "subject"]);
    await queryInterface.addIndex("questions", ["chapter"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("questions");
  },
};
