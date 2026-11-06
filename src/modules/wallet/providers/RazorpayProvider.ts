import { PaymentProvider, CreatePurchaseResult } from "./PaymentProvider";

// Phase 3 stub. Fill in when you go live:
//  - createPurchase -> create a Razorpay order for the pack's rupee amount
//  - verify -> crypto.createHmac('sha256', keySecret) over order_id|payment_id
//    and compare to the razorpay_signature sent by the app.
// Credits are granted ONLY after verify() returns true (never trust the client).
export class RazorpayProvider implements PaymentProvider {
  readonly name = "razorpay" as const;

  async createPurchase(_packCredits: number): Promise<CreatePurchaseResult> {
    throw new Error("RazorpayProvider not implemented yet — set PAYMENT_PROVIDER=demo for now");
  }

  async verify(_payload: Record<string, unknown>): Promise<boolean> {
    throw new Error("RazorpayProvider not implemented yet");
  }
}
