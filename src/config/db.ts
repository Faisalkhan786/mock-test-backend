import { Sequelize } from "sequelize";
import { env } from "./env";

// Connection pooling is critical for scale: reuse connections instead of
// opening a new one per request (that would choke MySQL under load).
const poolConfig = {
  max: 25,
  min: 2,
  acquire: 30000,
  idle: 10000,
};

// Primary connection — all writes and (until a replica exists) all reads.
export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: "mysql",
  logging: env.nodeEnv === "development" ? console.log : false,
  pool: poolConfig,
  // When DB_READ_HOST is set (Phase 3), Sequelize routes SELECTs to the replica
  // and writes to the primary automatically — no code changes needed.
  ...(env.db.readHost
    ? {
        replication: {
          write: {
            host: env.db.host,
            username: env.db.user,
            password: env.db.password,
          },
          read: [
            {
              host: env.db.readHost,
              username: env.db.user,
              password: env.db.password,
            },
          ],
        },
      }
    : {}),
});

export async function connectDb(): Promise<void> {
  await sequelize.authenticate();
  console.log("✅ MySQL connected");
}
