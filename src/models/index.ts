import { sequelize } from "../config/db";
import { User } from "./User";
import { Question } from "./Question";
import { Test } from "./Test";
import { TestQuestion } from "./TestQuestion";
import { Attempt } from "./Attempt";
import { WalletTxn } from "./WalletTxn";

// ---- Associations ----
Test.belongsToMany(Question, { through: TestQuestion, foreignKey: "testId", otherKey: "questionId" });
Question.belongsToMany(Test, { through: TestQuestion, foreignKey: "questionId", otherKey: "testId" });

User.hasMany(Attempt, { foreignKey: "userId" });
Attempt.belongsTo(User, { foreignKey: "userId" });

Test.hasMany(Attempt, { foreignKey: "testId" });
Attempt.belongsTo(Test, { foreignKey: "testId" });

User.hasMany(WalletTxn, { foreignKey: "userId" });
WalletTxn.belongsTo(User, { foreignKey: "userId" });

export { sequelize, User, Question, Test, TestQuestion, Attempt, WalletTxn };

// Schema is managed by migrations (npm run migrate) — no sync() anywhere,
// so data is never altered or dropped automatically.
