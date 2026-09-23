import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(key, {
      apiVersion: "2026-08-26.dahlia" as unknown as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return stripeClient;
}

/** @deprecated Use getStripe() — kept for convenience in Stripe-enabled paths */
export const stripe = {
  get checkout() {
    return getStripe().checkout;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
} as unknown as Stripe;

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}
