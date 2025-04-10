
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
    console.log("[WEBHOOK] Stripe webhook request received");
    
    // Get the stripe signature from the request header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("[WEBHOOK] No stripe signature found");
      throw new Error("No stripe signature found");
    }

    // Get the raw body
    const body = await req.text();
    console.log("[WEBHOOK] Webhook body received (truncated):", body.substring(0, 100) + "...");
    
    // Create Stripe instance with secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("[WEBHOOK] STRIPE_WEBHOOK_SECRET is not set in environment variables");
      throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`[WEBHOOK] Event successfully constructed: ${event.type}`);
    } catch (err) {
      console.error(`[WEBHOOK] Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log(`[WEBHOOK] Webhook event received: ${event.type}`, JSON.stringify(event.data.object.id));
    
    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        console.log('[WEBHOOK] Processing completed session:', JSON.stringify({
          id: session.id,
          mode: session.mode,
          payment_status: session.payment_status
        }));
        
        // Skip if not a payment or payment not successful
        if (session.mode !== 'payment' || session.payment_status !== 'paid') {
          console.log('[WEBHOOK] Not a completed payment, skipping');
          break;
        }
        
        console.log(`[WEBHOOK] Processing completed payment for session: ${session.id}`);
        
        try {
          // First, check if we already processed this session to prevent duplicates
          const { data: existingCompletedTx, error: existingTxError } = await supabaseClient
            .from('transactions')
            .select('id, status')
            .eq('transaction_id', session.id)
            .eq('status', 'completed')
            .maybeSingle();
            
          if (existingCompletedTx) {
            console.log(`[WEBHOOK] Session ${session.id} already marked as completed, skipping`);
            break;
          }
          
          // Retrieve the transaction using the session ID
          const { data: pendingTx, error: fetchError } = await supabaseClient
            .from('transactions')
            .select('*')
            .eq('transaction_id', session.id)
            .maybeSingle();
            
          if (fetchError) {
            console.error(`[WEBHOOK] Error fetching transaction: ${fetchError.message}`);
          }
          
          if (pendingTx) {
            // Transaction exists, update it
            console.log(`[WEBHOOK] Found transaction to update:`, JSON.stringify({
              id: pendingTx.id,
              status: pendingTx.status
            }));
            
            const { data: updatedTx, error: updateError } = await supabaseClient
              .from('transactions')
              .update({
                status: 'completed',
                updated_at: new Date().toISOString(),
                external_transaction_id: session.payment_intent || null,
                token_sent: false
              })
              .eq('transaction_id', session.id)
              .select()
              .single();
              
            if (updateError) {
              console.error(`[WEBHOOK] Error updating transaction: ${updateError.message}`);
              throw updateError;
            }
            
            console.log(`[WEBHOOK] Successfully updated transaction status for session ${session.id}`, updatedTx);
            
            // Create a notification for the user
            if (pendingTx.user_id) {
              const { error: notificationError } = await supabaseClient
                .from('notifications')
                .insert({
                  user_id: pendingTx.user_id,
                  type: 'payment_confirmed',
                  title: 'Payment Confirmed',
                  message: `Your payment of $${(session.amount_total / 100).toFixed(2)} has been confirmed. Tokens will be sent to your wallet shortly.`
                });
                
              if (notificationError) {
                console.error(`[WEBHOOK] Error creating notification: ${notificationError.message}`);
              } else {
                console.log(`[WEBHOOK] Successfully created notification for user ${pendingTx.user_id}`);
              }
            }
          } else {
            // If transaction doesn't exist, create it from webhook data
            console.log(`[WEBHOOK] Transaction not found, attempting to create from webhook data`);
            
            if (session.metadata?.user_id && session.metadata?.wallet_address) {
              const { data: newTx, error: createError } = await supabaseClient
                .from('transactions')
                .insert({
                  user_id: session.metadata.user_id,
                  amount: (session.amount_total / 100),
                  wallet_address: session.metadata.wallet_address,
                  payment_method: 'stripe',
                  status: 'completed',
                  transaction_id: session.id,
                  external_transaction_id: session.payment_intent || null,
                  token_sent: false
                })
                .select()
                .single();
                
              if (createError) {
                console.error(`[WEBHOOK] Error creating transaction from webhook: ${createError.message}`);
                throw createError;
              }
              console.log(`[WEBHOOK] Successfully created transaction record from webhook data`, newTx);
              
              // Create a notification for the user
              const { error: notificationError } = await supabaseClient
                .from('notifications')
                .insert({
                  user_id: session.metadata.user_id,
                  type: 'payment_confirmed',
                  title: 'Payment Confirmed',
                  message: `Your payment of $${(session.amount_total / 100).toFixed(2)} has been confirmed. Tokens will be sent to your wallet shortly.`
                });
                
              if (notificationError) {
                console.error(`[WEBHOOK] Error creating notification: ${notificationError.message}`);
              }
            } else {
              console.error(`[WEBHOOK] Cannot create transaction record: missing user_id or wallet_address in metadata`);
            }
          }
        } catch (updateError) {
          console.error(`[WEBHOOK] Exception in transaction update: ${updateError.message}`);
          console.error(updateError.stack || 'No stack trace available');
        }
        
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`[WEBHOOK] PaymentIntent ${paymentIntent.id} was successful!`);
        
        // Try to find transaction by payment_intent ID if we have it
        if (paymentIntent.id) {
          try {
            const { data: pendingTx, error: fetchError } = await supabaseClient
              .from('transactions')
              .select('*')
              .eq('external_transaction_id', paymentIntent.id)
              .maybeSingle();
              
            if (!fetchError && pendingTx && pendingTx.status !== 'completed') {
              // Update the transaction to completed
              const { error: updateError } = await supabaseClient
                .from('transactions')
                .update({
                  status: 'completed',
                  updated_at: new Date().toISOString()
                })
                .eq('id', pendingTx.id);
                
              if (updateError) {
                console.error(`[WEBHOOK] Error updating transaction from payment intent: ${updateError.message}`);
              } else {
                console.log(`[WEBHOOK] Successfully updated transaction from payment intent: ${paymentIntent.id}`);
              }
            }
          } catch (err) {
            console.error(`[WEBHOOK] Error processing payment intent: ${err.message}`);
          }
        }
        break;
      }
      
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`[WEBHOOK] Error processing webhook: ${error.message}`);
    console.error(error.stack || 'No stack trace available');
    return new Response(JSON.stringify({ error: `Webhook processing error: ${error.message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
