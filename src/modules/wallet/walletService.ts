import { Transaction } from "sequelize";
import { sequelize, User, WalletTxn } from "../../models";
import { AppError } from "../../middlewares/error";
import { env } from "../../config/env";
import { PaymentProvider } from "./providers/PaymentProvider";
import { DemoProvider } from "./providers/DemoProvider";
import { RazorpayProvider } from "./providers/RazorpayProvider";

// Pick the active provider from env. Change PAYMENT_PROVIDER to switch.
export const paymentProvider: PaymentProvider =
  env.payment.provider === "razorpay" ? new RazorpayProvider() : new DemoProvider();

// Add credits after a (demo or verified) purchase. Wallet balance and the
// ledger row are written in ONE transaction so they can never drift apart.
export async function addCredits(
  userId: number,
  credits: number,
  source: "demo" | "razorpay",
  reason: string
): Promise<number> {
  return sequelize.transaction(async (t: Transaction) => {
    const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!user) throw new AppError(404, "User not found");
    user.walletCredits += credits;
    await user.save({ transaction: t });
    await WalletTxn.create(
      { userId, type: "credit", amount: credits, source, reason },
      { transaction: t }
    );
    return user.walletCredits;
  });
}

// Debit exactly 1 credit to start a test. Row-locked so two parallel requests
// can't both spend the last credit (prevents double-spend under load).
export async function debitCredit(userId: number, reason: string): Promise<number> {
  return sequelize.transaction(async (t: Transaction) => {
    const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!user) throw new AppError(404, "User not found");
    if (user.walletCredits < 1) throw new AppError(402, "Not enough credits. Buy a test pack.");
    user.walletCredits -= 1;
    await user.save({ transaction: t });
    await WalletTxn.create(
      { userId, type: "debit", amount: 1, source: paymentProvider.name, reason },
      { transaction: t }
    );
    return user.walletCredits;
  });
}
