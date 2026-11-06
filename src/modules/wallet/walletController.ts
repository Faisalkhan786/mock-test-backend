import { Router, Response } from "express";
import { z } from "zod";
import { AuthedRequest, auth } from "../../middlewares/auth";
import { wrap } from "../../middlewares/error";
import { User } from "../../models";
import { addCredits, paymentProvider } from "./walletService";

const router = Router();

// Credit packs. Rupee price is shown in the app; here we only track credits.
const PACKS: Record<string, { credits: number; price: number }> = {
  starter: { credits: 20, price: 20 }, // ₹20 = 20 tests
  plus: { credits: 60, price: 49 },
};

// GET /wallet — current balance
router.get(
  "/",
  auth,
  wrap(async (req: AuthedRequest, res: Response) => {
    const user = await User.findByPk(req.userId, { attributes: ["walletCredits"] });
    res.json({ credits: user?.walletCredits ?? 0, packs: PACKS });
  })
);

// POST /wallet/buy  { packId }
// DEMO mode: grants credits instantly. RAZORPAY mode (later): this becomes
// "create order", and a separate /wallet/verify endpoint grants after payment.
const buySchema = z.object({ packId: z.enum(["starter", "plus"]) });
router.post(
  "/buy",
  auth,
  wrap(async (req: AuthedRequest, res: Response) => {
    const { packId } = buySchema.parse(req.body);
    const pack = PACKS[packId];

    const purchase = await paymentProvider.createPurchase(pack.credits);

    if (purchase.provider === "demo") {
      const balance = await addCredits(req.userId!, pack.credits, "demo", `demo:${packId}`);
      return res.json({ ok: true, mode: "demo", credits: balance });
    }

    // razorpay: return order details to the app to open the checkout
    res.json({ ok: true, mode: "razorpay", order: purchase.meta });
  })
);

export default router;
