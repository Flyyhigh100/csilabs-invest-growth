
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../coinpayments-ipn-webhook/utils.ts";

// Handle the GET /internal/twap/status route
serve(async (req) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This is a simplified mock response since we can't directly access the frontend's state
    // In a real implementation, we would store this data in a database or shared cache
    // For now, we'll create a simplified version that can be replaced with real data
    
    const mockStatus = {
      lastAttempt: new Date().toISOString(),
      lastError: null,
      lastPrice: 1.0007, // Example price based on console logs
      source: "v3Twap" // Most likely source based on console logs
    };

    // Return the status in JSON format
    return new Response(
      JSON.stringify(mockStatus),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error in internal-twap-status endpoint:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
