
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
      console.log(`[WEBHOOK] Event ID: ${event.id}`);
    } catch (err) {
      console.error(`[WEBHOOK] Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log(`[WEBHOOK] Processing webhook event: ${event.type}`, JSON.stringify({
      event_id: event.id, 
      object_id: event.data.object.id
    }));
    
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
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          customer: session.customer,
          metadata: session.metadata
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
            
          if (existingTxError) {
            console.error(`[WEBHOOK] Error checking existing transaction: ${existingTxError.message}`);
          }
            
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
            throw fetchError;
          }
          
          if (pendingTx) {
            // Transaction exists, update it
            console.log(`[WEBHOOK] Found transaction to update:`, JSON.stringify({
              id: pendingTx.id,
              current_status: pendingTx.status,
              amount: pendingTx.amount,
              wallet_address: pendingTx.wallet_address
            }));
            
            // Add explicit status log before updating
            console.log(`[WEBHOOK] STATUS UPDATE: Changing transaction ${pendingTx.id} status from "${pendingTx.status}" to "completed"`);
            
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
            
            console.log(`[WEBHOOK] Successfully updated transaction status for session ${session.id}`, 
              JSON.stringify({
                tx_id: updatedTx.id,
                new_status: updatedTx.status,
                payment_intent: session.payment_intent
              })
            );
            
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
              console.log(`[WEBHOOK] Successfully created transaction record from webhook data`, JSON.stringify({
                tx_id: newTx.id,
                amount: newTx.amount,
                status: newTx.status
              }));
              
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
              console.error(`[WEBHOOK] Cannot create transaction record: missing user_id or wallet_address in metadata`, 
                JSON.stringify(session.metadata)
              );
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
        console.log(`[WEBHOOK] PaymentIntent ${paymentIntent.id} was successful!`, JSON.stringify({
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata
        }));
        
        // Try to find transaction by payment_intent ID if we have it
        if (paymentIntent.id) {
          try {
            // First check by external_transaction_id field
            const { data: pendingTx, error: fetchError } = await supabaseClient
              .from('transactions')
              .select('*')
              .eq('external_transaction_id', paymentIntent.id)
              .maybeSingle();
              
            if (fetchError) {
              console.error(`[WEBHOOK] Error finding transaction by payment intent: ${fetchError.message}`);
            }
              
            if (pendingTx && pendingTx.status !== 'completed') {
              // Update the transaction to completed
              console.log(`[WEBHOOK] Found transaction by payment intent, updating to completed:`, JSON.stringify({
                tx_id: pendingTx.id,
                current_status: pendingTx.status,
                amount: pendingTx.amount
              }));
              
              // Add explicit status log before updating
              console.log(`[WEBHOOK] STATUS UPDATE: Changing transaction ${pendingTx.id} status from "${pendingTx.status}" to "completed"`);
              
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
                
                // Create a notification for the user
                if (pendingTx.user_id) {
                  const { error: notificationError } = await supabaseClient
                    .from('notifications')
                    .insert({
                      user_id: pendingTx.user_id,
                      type: 'payment_confirmed',
                      title: 'Payment Confirmed',
                      message: `Your payment of $${pendingTx.amount.toFixed(2)} has been confirmed. Tokens will be sent to your wallet shortly.`
                    });
                    
                  if (notificationError) {
                    console.error(`[WEBHOOK] Error creating notification: ${notificationError.message}`);
                  } else {
                    console.log(`[WEBHOOK] Successfully created notification for user ${pendingTx.user_id}`);
                  }
                }
              }
            } else if (pendingTx) {
              console.log(`[WEBHOOK] Transaction already marked as completed: ${pendingTx.id}`);
            } else {
              console.log(`[WEBHOOK] No transaction found with payment intent: ${paymentIntent.id}`);
              
              // Try to find by transaction_id in case external_transaction_id is not set
              const { data: txByTransactionId, error: txError } = await supabaseClient
                .from('transactions')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(5);
                
              if (txError) {
                console.error(`[WEBHOOK] Error finding recent pending transactions: ${txError.message}`);
              } else if (txByTransactionId && txByTransactionId.length > 0) {
                console.log(`[WEBHOOK] Found ${txByTransactionId.length} recent pending transactions, checking for matches`);
                
                // Log all recent transactions for debugging
                txByTransactionId.forEach((tx, idx) => {
                  console.log(`[WEBHOOK] Recent pending tx #${idx+1}:`, JSON.stringify({
                    id: tx.id,
                    transaction_id: tx.transaction_id,
                    external_transaction_id: tx.external_transaction_id,
                    status: tx.status,
                    created_at: tx.created_at
                  }));
                });
              }
              
              // Try to find by metadata if available
              if (paymentIntent.metadata?.session_id) {
                console.log(`[WEBHOOK] Trying to find transaction by session ID: ${paymentIntent.metadata.session_id}`);
                
                const { data: sessionTx, error: sessionFetchError } = await supabaseClient
                  .from('transactions')
                  .select('*')
                  .eq('transaction_id', paymentIntent.metadata.session_id)
                  .maybeSingle();
                
                if (sessionFetchError) {
                  console.error(`[WEBHOOK] Error finding transaction by session ID: ${sessionFetchError.message}`);
                } else if (sessionTx && sessionTx.status !== 'completed') {
                  console.log(`[WEBHOOK] Found transaction by session ID, updating status:`, JSON.stringify({
                    tx_id: sessionTx.id,
                    current_status: sessionTx.status
                  }));
                  
                  // Add explicit status log before updating
                  console.log(`[WEBHOOK] STATUS UPDATE: Changing transaction ${sessionTx.id} status from "${sessionTx.status}" to "completed"`);
                  
                  const { error: updateError } = await supabaseClient
                    .from('transactions')
                    .update({
                      status: 'completed',
                      external_transaction_id: paymentIntent.id,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', sessionTx.id);
                    
                  if (updateError) {
                    console.error(`[WEBHOOK] Error updating transaction by session ID: ${updateError.message}`);
                  } else {
                    console.log(`[WEBHOOK] Successfully updated transaction by session ID: ${paymentIntent.metadata.session_id}`);
                  }
                }
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

    return new Response(JSON.stringify({ received: true, event: event.type }), {
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
