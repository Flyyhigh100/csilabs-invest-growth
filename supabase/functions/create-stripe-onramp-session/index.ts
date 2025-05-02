
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting create-stripe-onramp-session function...");
    
    // Parse the request body
    const { walletAddress, amount, tokenPrice } = await req.json();
    console.log(`Received request for wallet: ${walletAddress}, amount: ${amount}, tokenPrice: ${tokenPrice || 'not provided'}`);
    
    // Validate required parameters
    if (!walletAddress) {
      console.error("Missing required parameter: walletAddress");
      return new Response(JSON.stringify({ 
        error: "Wallet address is required",
        details: "Please provide a valid wallet address"
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      });
    }
    
    // Initialize Supabase client with the anon key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the user's ID from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(JSON.stringify({ 
        error: "Missing authorization header",
        details: "Authentication required" 
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401 
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("Authentication failed:", userError);
      return new Response(JSON.stringify({ 
        error: "Authentication failed",
        details: userError?.message || "Unable to verify user identity"
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401 
      });
    }
    
    const userId = userData.user.id;
    console.log(`Authenticated user: ${userId} (${userData.user.email || 'no email'})`);

    // Get client IP address for tracking and fraud prevention
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    console.log("Client IP:", clientIp);

    // Check if Stripe API key is available
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY_CRYPTO");
    if (!stripeSecretKey) {
      console.error("Missing STRIPE_SECRET_KEY_CRYPTO environment variable");
      return new Response(JSON.stringify({ 
        error: "Stripe Crypto API key is not configured",
        details: "Administrator needs to set STRIPE_SECRET_KEY_CRYPTO in Supabase secrets"
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      });
    }

    // Initialize Stripe client with the crypto key
    // This version uses an older API version which should be more compatible
    console.log("Initializing Stripe with API version 2023-10-16...");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16"
    });

    try {
      // Create a crypto onramp session using the stable embedded mode instead
      console.log("Creating Stripe crypto onramp session with client_secret...");

      const sessionParams = {
        wallet_addresses: {
          ethereum: walletAddress,
          solana: walletAddress,
          polygon: walletAddress,
        },
        transaction_details: {
          destination_currency: "usdc",
          destination_exchange_amount: amount || 100,
          destination_network: "ethereum",
        },
        customer_information: {
          email: userData.user.email,
        },
        metadata: {
          user_id: userId,
          wallet_address: walletAddress,
          amount: amount ? amount.toString() : "100",
          token_price: tokenPrice ? tokenPrice.toString() : "1.00"
        }
      };
      
      console.log("Session params prepared:", JSON.stringify(sessionParams));
      
      // Create a crypto onramp session
      const session = await stripe.crypto.onrampSessions.create(sessionParams);
      console.log("Successfully created Stripe onramp session with ID:", session.id);

      // Create a transaction record in our database
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      
      try {
        // Create transaction record
        const transactionData = {
          user_id: userId,
          amount: amount || 100,
          payment_method: "stripe_crypto",
          wallet_address: walletAddress,
          status: "pending",
          transaction_id: session.id,
          external_transaction_id: session.id,
          token_price: tokenPrice || 1.00,
          token_amount: tokenPrice ? amount / tokenPrice : amount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: transaction, error } = await supabaseAdmin
          .from("transactions")
          .insert(transactionData)
          .select()
          .single();
          
        if (error) {
          console.error("Error creating transaction record:", error);
        } else {
          console.log(`Created transaction record: ${transaction.id} with session ID: ${session.id}`);
        }
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        // Continue the process even if DB operation fails
      }

      // Return the client secret for the frontend to use with Stripe embedded components
      return new Response(JSON.stringify({ 
        success: true,
        client_secret: session.client_secret,
        session_id: session.id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
      
      // Detailed error handling
      let errorMessage = "An error occurred with the Stripe API";
      let errorDetails = "";
      
      if (stripeError instanceof Error) {
        errorMessage = stripeError.message;
        errorDetails = stripeError.stack || "";
        
        // Check for specific Stripe errors
        if ('code' in stripeError) {
          const stripeErrorCode = (stripeError as any).code;
          
          if (stripeErrorCode === 'api_key_expired') {
            errorDetails = "The Stripe API key is expired. Please update to a new API key.";
          } else if (stripeErrorCode === 'invalid_request_error') {
            errorDetails = "The request to Stripe was invalid. Check your API key permissions.";
          } else if (stripeErrorCode === 'permission_error') {
            errorDetails = "Your Stripe API key doesn't have permission to create onramp sessions. Check that 'crypto.onrampSessions: write' is enabled.";
          }
        }
      }
      
      return new Response(JSON.stringify({ 
        error: "Stripe API error", 
        message: errorMessage,
        details: errorDetails,
        suggestion: "Verify that your Stripe API key has the 'crypto.onrampSessions: write' permission enabled."
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error creating onramp session: ${message}`);
    console.error(error instanceof Error ? error.stack : "No stack trace available");
    
    return new Response(JSON.stringify({ 
      error: message,
      details: error instanceof Error ? error.stack : "No additional details available" 
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500 
    });
  }
});
