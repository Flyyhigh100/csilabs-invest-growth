
import Stripe from "https://esm.sh/stripe@14.21.0";

/**
 * Verifies the Stripe webhook signature and constructs the event
 */
export async function verifyStripeWebhook(body: string, signature: string): Promise<Stripe.Event> {
  // Create Stripe instance with secret key
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  // Get the webhook secret from environment variables
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("[WEBHOOK] STRIPE_WEBHOOK_SECRET is not set in environment variables");
    throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
  }

  try {
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`[WEBHOOK] Event successfully constructed: ${event.type}`);
    console.log(`[WEBHOOK] Event ID: ${event.id}`);
    return event;
  } catch (err) {
    console.error(`[WEBHOOK] Webhook signature verification failed: ${err.message}`);
    throw new Error(`Webhook Error: ${err.message}`);
  }
}
