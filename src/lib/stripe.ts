import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.warn("WARNING: STRIPE_SECRET_KEY is not defined. Stripe integration will not work.");
}

export const stripe = apiKey ? new Stripe(apiKey, {
  apiVersion: "2024-12-18.acacia" as any,
  typescript: true,
}) : null;
