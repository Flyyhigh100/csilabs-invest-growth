
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClients } from "./clients.ts";
import { handleStripeWebhook } from "./handlers.ts";

// Define CORS headers directly in this file instead of importing
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main entry point
serve(async (req) => {
  // Log incoming request
  console.log("[WEBHOOK] Stripe webhook request received");
  console.log("[WEBHOOK] Request method:", req.method);
  console.log("[WEBHOOK] Request headers:", JSON.stringify(Object.fromEntries(req.headers)));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[WEBHOOK] Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  // IMPORTANT: Skip authentication for Stripe webhooks
  // Stripe webhooks don't include authorization headers
  // We'll verify the request using the Stripe signature instead

  return await handleStripeWebhook(req);
});

