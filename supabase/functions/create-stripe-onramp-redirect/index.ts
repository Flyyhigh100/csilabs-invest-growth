
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
    // Parse the request body
    const { walletAddress, amount, tokenPrice } = await req.json();
    
    // Validate required parameters
    if (!walletAddress) {
      throw new Error("Wallet address is required");
    }
    
    // Initialize Supabase client with the anon key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the user's ID from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }
    
    const userId = userData.user.id;

    // Get client IP address
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
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-04-10"
    });

    try {
      console.log("Creating Stripe crypto onramp session with redirect_url...");
      
      // Create a crypto onramp session with redirect_url
      const session = await stripe.crypto.onrampSessions.create({
        customer_ip_address: clientIp,
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
          token_price: tokenPrice ? tokenPrice.toString() : "1.00",
          return_url: `${req.headers.get("origin")}/dashboard/payments?status=success`
        }
      });
      
      console.log("Successfully created Stripe onramp session with ID:", session.id);
      console.log("Redirect URL available:", !!session.redirect_url);

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

      // Return the redirect URL for the hosted page
      return new Response(JSON.stringify({ 
        redirect_url: session.redirect_url,
        session_id: session.id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
      
      // Check if it's a Stripe library error
      const errorMessage = stripeError instanceof Error 
        ? stripeError.message 
        : "Unknown Stripe error";
      
      return new Response(JSON.stringify({ 
        error: "Stripe API error", 
        message: errorMessage,
        details: "The Stripe Crypto API returned an error. Please check your Stripe configuration."
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error creating onramp session: ${message}`);
    
    return new Response(JSON.stringify({ 
      error: message,
      details: error instanceof Error ? error.stack : "No additional details available" 
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400 
    });
  }
});
