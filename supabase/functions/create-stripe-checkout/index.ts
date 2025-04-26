
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const BASE_URL = "https://hrhvliqkmetcdphnetxb.supabase.co";
// Used to build success/cancel URLs based on the request origin

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { amount, walletAddress, tokenPrice } = await req.json();
    
    // Validate required parameters
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }
    
    if (!walletAddress) {
      throw new Error("Wallet address is required");
    }
    
    // Log the token price if provided
    console.log(`Received token price: ${tokenPrice || 'Not provided'}`);
    
    // Calculate token amount based on price if available (fallback to 1:1)
    const tokenAmount = tokenPrice ? amount / tokenPrice : amount;
    console.log(`Calculated token amount: ${tokenAmount}`);
    
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
    const userEmail = userData.user.email;

    // Initialize Stripe client
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16"
    });

    // Set up the success and cancel URLs
    const origin = req.headers.get("origin") || "https://yourapp.com"; // Fallback URL
    const successUrl = `${origin}/dashboard/transactions?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/dashboard/transactions?canceled=true`;

    // Create a Stripe Checkout Session
    const amountInCents = Math.round(amount * 100);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Token Purchase - $${amount}`,
              description: `Purchase of ${tokenAmount.toFixed(5)} CSi tokens for wallet address: ${walletAddress}`,
            },
            unit_amount: amountInCents, // amount in cents
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: {
        user_id: userId,
        wallet_address: walletAddress,
        amount: amount,
        token_price: tokenPrice ? tokenPrice.toString() : "1.00",
        token_amount: tokenAmount.toString(),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // First, create the transaction record in our database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Check if the transactions table has the token_amount column
    try {
      // Create transaction record with consistent field format
      const transactionData = {
        user_id: userId,
        amount: amount,
        payment_method: "stripe",
        wallet_address: walletAddress,
        status: "pending",
        transaction_id: session.id,
        external_transaction_id: session.payment_intent || null,  // Store payment_intent if available
        token_price: tokenPrice || 1.00
      };
      
      // Add token_amount only if the column exists
      if (tokenAmount !== undefined) {
        transactionData.token_amount = tokenAmount;
      }
      
      const { data: transaction, error } = await supabaseAdmin
        .from("transactions")
        .insert(transactionData)
        .select()
        .single();
        
      if (error) {
        console.error("Error creating transaction record:", error);
        
        // If the error is related to the token_amount column, try again without it
        if (error.message && error.message.includes("token_amount")) {
          console.log("Retrying without token_amount field");
          delete transactionData.token_amount;
          
          const { data: retryTransaction, error: retryError } = await supabaseAdmin
            .from("transactions")
            .insert(transactionData)
            .select()
            .single();
            
          if (retryError) {
            throw new Error(`Failed to create transaction record on retry: ${retryError.message}`);
          }
          
          console.log(`Created transaction record on retry: ${retryTransaction.id} with session ID: ${session.id}`);
        } else {
          throw new Error(`Failed to create transaction record: ${error.message}`);
        }
      } else {
        console.log(`Created transaction record: ${transaction.id} with session ID: ${session.id}`);
        console.log(`Payment intent ID (if available): ${session.payment_intent || 'Not available yet'}`);
        console.log(`Token price: ${tokenPrice || '1.00'}, Token amount: ${tokenAmount}`);
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      // Continue the checkout process even if DB operation fails
      // We'll log the error but still return the checkout URL to the user
    }

    // Return the URL and session ID
    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      payment_intent: session.payment_intent || null,
      user_id: userId,
      token_amount: tokenAmount,
      token_price: tokenPrice || 1.00
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error creating checkout session: ${message}`);
    
    return new Response(JSON.stringify({ error: message }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400 
    });
  }
});
