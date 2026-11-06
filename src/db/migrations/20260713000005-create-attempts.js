"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attempts", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      testId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      answers: { type: Sequelize.JSON, allowNull: true },
      score: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      correctCount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      // `rank` is a reserved word in MySQL 8 — sequelize quotes it automatically.
      rank: { type: Sequelize.INTEGER, allowNull: true },
      status: { type: Sequelize.ENUM("started", "submitted"), defaultValue: "started" },
      startedAt: { type: Sequelize.DATE, allowNull: true },
      submittedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("attempts", ["userId"]);
    await queryInterface.addIndex("attempts", ["testId"]);
    await queryInterface.addIndex("attempts", ["userId", "testId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("attempts");
  },
};
