import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db";

// Bilingual by design: every visible string has a _hi and _en column.
// correctIndex NEVER leaves the backend during a live test.
export class Question extends Model<InferAttributes<Question>, InferCreationAttributes<Question>> {
  declare id: CreationOptional<number>;
  declare questionHi: string;
  declare questionEn: string;
  declare optionsHi: string[]; // JSON array of 4 options
  declare optionsEn: string[];
  declare correctIndex: number; // 0-3
  declare solutionHi: CreationOptional<string | null>;
  declare solutionEn: CreationOptional<string | null>;
  declare subject: string;
  declare chapter: CreationOptional<string | null>;
  declare difficulty: CreationOptional<"easy" | "medium" | "hard">;
  declare classLevel: number;
}

Question.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    questionHi: { type: DataTypes.TEXT, allowNull: false },
    questionEn: { type: DataTypes.TEXT, allowNull: false },
    optionsHi: { type: DataTypes.JSON, allowNull: false },
    optionsEn: { type: DataTypes.JSON, allowNull: false },
    correctIndex: { type: DataTypes.TINYINT, allowNull: false },
    solutionHi: { type: DataTypes.TEXT, allowNull: true },
    solutionEn: { type: DataTypes.TEXT, allowNull: true },
    subject: { type: DataTypes.STRING(50), allowNull: false },
    chapter: { type: DataTypes.STRING(80), allowNull: true },
    difficulty: { type: DataTypes.ENUM("easy", "medium", "hard"), defaultValue: "medium" },
    classLevel: { type: DataTypes.TINYINT, allowNull: false },
  },
  {
    sequelize,
    tableName: "questions",
    indexes: [{ fields: ["classLevel", "subject"] }, { fields: ["chapter"] }],
  }
);
