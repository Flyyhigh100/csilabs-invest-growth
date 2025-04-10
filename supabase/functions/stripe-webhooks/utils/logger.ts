
import Stripe from "https://esm.sh/stripe@14.21.0";

/**
 * Log webhook event information
 */
export function logWebhookEvent(event: Stripe.Event, prefix: string = '') {
  console.log(`${prefix} Event type: ${event.type}`);
  console.log(`${prefix} Event ID: ${event.id}`);
  console.log(`${prefix} Object ID: ${event.data.object.id}`);
}
