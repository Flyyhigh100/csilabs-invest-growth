
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClients } from "./clients.ts";
import { handleStripeWebhook } from "./handlers.ts";
import { corsHeaders } from "./utils.ts";

// Main entry point
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  return await handleStripeWebhook(req);
});
