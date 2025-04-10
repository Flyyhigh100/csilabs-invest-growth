
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Stripe webhook received");
    
    // Get the stripe signature from the request header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No stripe signature found");
      throw new Error("No stripe signature found");
    }

    // Get the raw body
    const body = await req.text();
    console.log("Webhook body received:", body.substring(0, 200) + "...");
    
    // Create Stripe instance with secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
      throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`Event successfully constructed: ${event.type}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log(`Webhook event received: ${event.type}`);
    
    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        console.log('Processing completed session:', JSON.stringify(session, null, 2));
        
        // Skip if not a payment or payment not successful
        if (session.mode !== 'payment' || session.payment_status !== 'paid') {
          console.log('Not a completed payment, skipping');
          break;
        }
        
        console.log(`Processing completed payment for session: ${session.id}`);
        
        try {
          // Retrieve the transaction using the session ID
          const { data: transactions, error: fetchError } = await supabaseClient
            .from('transactions')
            .select('*')
            .eq('transaction_id', session.id);
            
          if (fetchError || !transactions || transactions.length === 0) {
            console.error(`Error fetching transaction or transaction not found: ${fetchError?.message || 'No transaction found'}`);
            console.log(`Attempting to create transaction record from webhook data...`);
            
            // If transaction doesn't exist, try to create it from the webhook data (fallback)
            if (session.metadata?.user_id && session.metadata?.wallet_address) {
              const { error: createError } = await supabaseClient
                .from('transactions')
                .insert({
                  user_id: session.metadata.user_id,
                  amount: (session.amount_total / 100),
                  wallet_address: session.metadata.wallet_address,
                  payment_method: 'stripe',
                  status: 'completed',
                  transaction_id: session.id,
                  external_transaction_id: session.payment_intent || null,
                  token_sent: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (createError) {
                console.error(`Error creating transaction from webhook: ${createError.message}`);
                throw createError;
              }
              console.log(`Successfully created transaction record from webhook data`);
            } else {
              console.error(`Cannot create transaction record: missing user_id or wallet_address in metadata`);
            }
          } else {
            // Transaction exists, update it
            console.log(`Found transaction to update:`, JSON.stringify(transactions[0]));
            
            const { data, error: updateError } = await supabaseClient
              .from('transactions')
              .update({
                status: 'completed',
                updated_at: new Date().toISOString(),
                external_transaction_id: session.payment_intent || null,
                token_sent: false
              })
              .eq('transaction_id', session.id)
              .select();
              
            if (updateError) {
              console.error(`Error updating transaction: ${updateError.message}`);
              throw updateError;
            }
            
            console.log(`Successfully updated transaction status for session ${session.id}`, data);
          }
          
          // Create a notification for the user
          if (session.metadata?.user_id) {
            const { error: notificationError } = await supabaseClient
              .from('notifications')
              .insert({
                user_id: session.metadata.user_id,
                type: 'payment_confirmed',
                title: 'Payment Confirmed',
                message: `Your payment of $${(session.amount_total / 100).toFixed(2)} has been confirmed. Tokens will be sent to your wallet shortly.`
              });
              
            if (notificationError) {
              console.error(`Error creating notification: ${notificationError.message}`);
            } else {
              console.log(`Successfully created notification for user ${session.metadata.user_id}`);
            }
          }
        } catch (updateError) {
          console.error(`Exception in transaction update: ${updateError.message}`);
          console.error(updateError.stack || 'No stack trace available');
        }
        
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
        // Additional handling if needed
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    console.error(error.stack || 'No stack trace available');
    return new Response(JSON.stringify({ error: `Webhook processing error: ${error.message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
