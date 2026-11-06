import { PaymentProvider, CreatePurchaseResult } from "./PaymentProvider";

// ACTIVE now: grants credits instantly, no real money. Lets you test the whole
// app end-to-end before wiring up Razorpay.
export class DemoProvider implements PaymentProvider {
  readonly name = "demo" as const;

  async createPurchase(packCredits: number): Promise<CreatePurchaseResult> {
    return { provider: "demo", credits: packCredits };
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
