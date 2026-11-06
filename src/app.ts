import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/error";
import authRoutes from "./modules/auth/authController";
import testsRoutes from "./modules/tests/testsController";
import walletRoutes from "./modules/wallet/walletController";

export function createApp() {
  const app = express();

  // Requests ngrok/load-balancer ke through aati hain (ek proxy hop).
  // Isse rate-limiter asli client IP sahi padhta hai (X-Forwarded-For).
  // '1' = ek proxy pe bharosa (ngrok). Production LB ke hisaab se badha sakte ho.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Global soft rate limit — abuse guard across all routes.
  app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRoutes);
  app.use("/tests", testsRoutes);
  app.use("/wallet", walletRoutes);

  app.use(errorHandler);
  return app;
}
