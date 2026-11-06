import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare phone: string;
  declare name: CreationOptional<string | null>;
  declare classLevel: CreationOptional<number>; // 9 or 10
  declare language: CreationOptional<"hi" | "en">; // hi = hinglish (default)
  declare walletCredits: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    phone: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(80), allowNull: true },
    classLevel: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 10 },
    language: { type: DataTypes.ENUM("hi", "en"), allowNull: false, defaultValue: "hi" },
    walletCredits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "users", indexes: [{ fields: ["phone"] }] }
);
