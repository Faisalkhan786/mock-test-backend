import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db";

// Join table: which questions belong to a test, and in what order.
export class TestQuestion extends Model<
  InferAttributes<TestQuestion>,
  InferCreationAttributes<TestQuestion>
> {
  declare id: CreationOptional<number>;
  declare testId: number;
  declare questionId: number;
  declare order: number;
}

TestQuestion.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    testId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    questionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: "test_questions",
    indexes: [{ fields: ["testId"] }, { unique: true, fields: ["testId", "questionId"] }],
  }
);
