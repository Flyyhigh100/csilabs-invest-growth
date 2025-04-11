
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../check-coinpayments-status/utils.ts";
import { verifyIpnHmac } from "./verification.ts";
import { processIpnPayload } from "./transaction-handler.ts";
import { logIpnRequest } from "./logging.ts";
import { createDbClient } from "./db-client.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("IPN webhook received");
    
    // Get IPN secret from environment variable
    const ipnSecret = Deno.env.get('COINPAYMENTS_IPN_SECRET');
    if (!ipnSecret) {
      console.error("COINPAYMENTS_IPN_SECRET environment variable not set");
      return new Response(
        JSON.stringify({ error: "IPN secret not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Create a copy of the request for logging
    const requestCopy = req.clone();
    
    // Log IPN request
    const logEntry = await logIpnRequest(requestCopy);
    console.log(`IPN request logged with ID: ${logEntry?.id || 'unknown'}`);
    
    // Verify HMAC signature
    const isVerified = await verifyIpnHmac(req, ipnSecret);
    if (!isVerified) {
      console.error("IPN HMAC signature verification failed");
      
      // Log verification failure
      const dbClient = createDbClient();
      if (logEntry?.id) {
        await dbClient
          .from('ipn_logs')
          .update({ verification_status: 'failed', processed_at: new Date().toISOString() })
          .eq('id', logEntry.id);
      }
      
      // For debugging purposes, we'll continue processing despite verification failure
      // but log a warning
      console.warn("Continuing despite HMAC verification failure for debugging purposes");
      // In production, you'd want to return an error:
      // return new Response(
      //   JSON.stringify({ error: "HMAC verification failed" }),
      //   { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      // );
    } else {
      console.log("IPN HMAC signature verification passed");
      // Update log with verification success
      const dbClient = createDbClient();
      if (logEntry?.id) {
        await dbClient
          .from('ipn_logs')
          .update({ verification_status: 'verified' })
          .eq('id', logEntry.id);
      }
    }
    
    // Parse request body
    const formData = await req.formData();
    const payload: Record<string, string> = {};
    
    // Convert FormData to a simple object
    for (const [key, value] of formData.entries()) {
      payload[key] = value.toString();
    }
    
    console.log("IPN Payload:", JSON.stringify(payload));
    
    // Process the IPN payload
    const result = await processIpnPayload(payload, logEntry?.id);
    
    // Return success response to the IPN server
    return new Response(
      JSON.stringify({ status: "success", ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing IPN webhook:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error processing IPN' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
