
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClients } from "./clients.ts";
import { handleStripeWebhook } from "./handlers.ts";
import { corsHeaders } from "../create-coinpayments-payment/utils.ts";

// Main entry point
// Version: [Timestamp or simple counter]
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // IMPORTANT: Skip authentication for Stripe webhooks
  // Stripe webhooks don't include authorization headers
  // We'll verify the request using the Stripe signature instead

  return await handleStripeWebhook(req);
});
