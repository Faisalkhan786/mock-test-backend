import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db";

export class WalletTxn extends Model<InferAttributes<WalletTxn>, InferCreationAttributes<WalletTxn>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare type: "credit" | "debit";
  declare amount: number; // number of credits
  declare source: CreationOptional<"demo" | "razorpay">;
  declare reason: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
}

WalletTxn.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    type: { type: DataTypes.ENUM("credit", "debit"), allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    source: { type: DataTypes.ENUM("demo", "razorpay"), defaultValue: "demo" },
    reason: { type: DataTypes.STRING(120), allowNull: true },
    createdAt: DataTypes.DATE,
  },
  { sequelize, tableName: "wallet_txns", updatedAt: false, indexes: [{ fields: ["userId"] }] }
);
