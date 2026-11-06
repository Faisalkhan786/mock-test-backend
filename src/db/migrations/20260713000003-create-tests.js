"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tests", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      titleHi: { type: Sequelize.STRING(160), allowNull: false },
      titleEn: { type: Sequelize.STRING(160), allowNull: false },
      type: { type: Sequelize.ENUM("mock", "pyq"), allowNull: false, defaultValue: "mock" },
      classLevel: { type: Sequelize.TINYINT, allowNull: false },
      subject: { type: Sequelize.STRING(50), allowNull: false },
      durationMin: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 20 },
      totalMarks: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      negativeMarks: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      isFree: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("tests", ["classLevel", "subject", "type"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tests");
  },
};
