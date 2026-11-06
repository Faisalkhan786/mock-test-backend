import { Router, Request, Response } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { redis } from "../../config/redis";
import { env } from "../../config/env";
import { wrap, AppError } from "../../middlewares/error";
import { signToken } from "../../middlewares/auth";
import { User } from "../../models";

const router = Router();

// Stop OTP spam: max 5 send requests per phone window.
const otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5 });

const phoneSchema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile") });

// POST /auth/send-otp  { phone }
router.post(
  "/send-otp",
  otpLimiter,
  wrap(async (req: Request, res: Response) => {
    const { phone } = phoneSchema.parse(req.body);

    // Demo mode: fixed OTP, no SMS gateway needed. Flip OTP_DEMO_MODE=false and
    // plug an SMS provider (MSG91 / Fast2SMS) to send a real random OTP.
    const otp = env.otpDemoMode ? "123456" : String(Math.floor(100000 + Math.random() * 900000));

    await redis.set(`otp:${phone}`, otp, "EX", 300); // 5 min expiry
    res.json({ ok: true, demo: env.otpDemoMode, ...(env.otpDemoMode ? { otp } : {}) });
  })
);

// POST /auth/verify-otp  { phone, otp }
const verifySchema = phoneSchema.extend({ otp: z.string().length(6) });
router.post(
  "/verify-otp",
  wrap(async (req: Request, res: Response) => {
    const { phone, otp } = verifySchema.parse(req.body);

    const saved = await redis.get(`otp:${phone}`);
    if (!saved || saved !== otp) throw new AppError(401, "Wrong or expired OTP");
    await redis.del(`otp:${phone}`);

    // First login creates the account (upsert-style).
    const [user] = await User.findOrCreate({ where: { phone }, defaults: { phone } });

    res.json({
      ok: true,
      token: signToken(user.id),
      user: { id: user.id, phone: user.phone, name: user.name, language: user.language, credits: user.walletCredits },
    });
  })
);

export default router;
