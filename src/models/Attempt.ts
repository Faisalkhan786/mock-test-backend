import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db";

export class Attempt extends Model<InferAttributes<Attempt>, InferCreationAttributes<Attempt>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare testId: number;
  declare answers: CreationOptional<Record<number, number> | null>; // { questionId: chosenIndex }
  declare score: CreationOptional<number>;
  declare correctCount: CreationOptional<number>;
  declare rank: CreationOptional<number | null>;
  declare status: CreationOptional<"started" | "submitted">;
  declare startedAt: CreationOptional<Date>;
  declare submittedAt: CreationOptional<Date | null>;
}

Attempt.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    testId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    answers: { type: DataTypes.JSON, allowNull: true },
    score: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    correctCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    rank: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.ENUM("started", "submitted"), defaultValue: "started" },
    startedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    submittedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "attempts",
    indexes: [{ fields: ["userId"] }, { fields: ["testId"] }, { fields: ["userId", "testId"] }],
  }
);
