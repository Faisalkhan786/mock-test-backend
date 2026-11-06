"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Note: model sets updatedAt:false, so this table has only createdAt.
    await queryInterface.createTable("wallet_txns", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      type: { type: Sequelize.ENUM("credit", "debit"), allowNull: false },
      amount: { type: Sequelize.INTEGER, allowNull: false },
      source: { type: Sequelize.ENUM("demo", "razorpay"), defaultValue: "demo" },
      reason: { type: Sequelize.STRING(120), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("wallet_txns", ["userId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wallet_txns");
  },
};
