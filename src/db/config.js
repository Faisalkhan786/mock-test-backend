// Config used ONLY by sequelize-cli for migrations. Reads from the same .env
// as the app, so there is one source of truth for DB credentials.
require("dotenv").config();

const base = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || "mocktest",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  dialect: "mysql",
};

module.exports = {
  development: base,
  production: base,
};
