"use strict";

// Column names match the Sequelize models exactly (camelCase, e.g. classLevel).
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      phone: { type: Sequelize.STRING(15), allowNull: false, unique: true },
      name: { type: Sequelize.STRING(80), allowNull: true },
      classLevel: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 10 },
      language: { type: Sequelize.ENUM("hi", "en"), allowNull: false, defaultValue: "hi" },
      walletCredits: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("users", ["phone"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
