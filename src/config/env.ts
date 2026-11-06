import dotenv from "dotenv";
dotenv.config();

function req(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (v === undefined) throw new Error(`Missing env var: ${key}`);
  return v;
}

export const env = {
  port: Number(req("PORT", "4000")),
  nodeEnv: req("NODE_ENV", "development"),

  db: {
    host: req("DB_HOST", "127.0.0.1"),
    port: Number(req("DB_PORT", "3306")),
    name: req("DB_NAME", "mocktest"),
    user: req("DB_USER", "root"),
    password: process.env.DB_PASSWORD ?? "",
    readHost: process.env.DB_READ_HOST || "", // empty => use primary
  },

  redis: {
    host: req("REDIS_HOST", "127.0.0.1"),
    port: Number(req("REDIS_PORT", "6379")),
    // Local Redis me password nahi hota — khaali chhod do.
    // Cloud/production Redis (Upstash, ElastiCache) me yaha password aayega.
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: req("JWT_SECRET"),
    expiresIn: req("JWT_EXPIRES_IN", "30d"),
  },

  otpDemoMode: (process.env.OTP_DEMO_MODE ?? "true") === "true",

  payment: {
    provider: (process.env.PAYMENT_PROVIDER ?? "demo") as "demo" | "razorpay",
  },
};
