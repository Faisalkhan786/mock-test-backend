// Common interface every payment provider implements.
// Swapping demo -> razorpay later means implementing this once; the rest of
// the wallet code never changes.
export interface CreatePurchaseResult {
  provider: "demo" | "razorpay";
  credits: number;
  // razorpay will add orderId etc. here; demo needs nothing.
  meta?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: "demo" | "razorpay";
  // Returns how many credits to grant for a given pack. For demo it's instant;
  // for razorpay this becomes "create order" and grant happens after verify().
  createPurchase(packCredits: number): Promise<CreatePurchaseResult>;
  // razorpay verifies signature here; demo always returns true.
  verify(payload: Record<string, unknown>): Promise<boolean>;
}
