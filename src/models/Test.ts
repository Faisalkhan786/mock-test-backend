import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db";

export class Test extends Model<InferAttributes<Test>, InferCreationAttributes<Test>> {
  declare id: CreationOptional<number>;
  declare titleHi: string;
  declare titleEn: string;
  declare type: "mock" | "pyq"; // pyq = previous year paper
  declare classLevel: number;
  declare subject: string;
  declare durationMin: number;
  declare totalMarks: CreationOptional<number>;
  declare negativeMarks: CreationOptional<number>; // e.g. 0.25 per wrong
  declare isFree: CreationOptional<boolean>;
}

Test.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    titleHi: { type: DataTypes.STRING(160), allowNull: false },
    titleEn: { type: DataTypes.STRING(160), allowNull: false },
    type: { type: DataTypes.ENUM("mock", "pyq"), allowNull: false, defaultValue: "mock" },
    classLevel: { type: DataTypes.TINYINT, allowNull: false },
    subject: { type: DataTypes.STRING(50), allowNull: false },
    durationMin: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 20 },
    totalMarks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    negativeMarks: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    isFree: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, tableName: "tests", indexes: [{ fields: ["classLevel", "subject", "type"] }] }
);
