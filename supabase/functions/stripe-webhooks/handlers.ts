
import { corsHeaders } from "./utils.ts";
import { createClients, verifyStripeSignatureAsync } from "./clients.ts";
import { handleCheckoutSessionCompleted, handlePaymentIntentSucceeded } from "./event-handlers.ts";
import { findRecentPendingTransactions } from "./utils.ts";
import { checkAndUpdatePayment } from "./stripe-ops.ts";

// Main handler for Stripe webhook events
export const handleStripeWebhook = async (req: Request) => {
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
    
    // Verify the webhook signature using the ASYNC version
    let event;
    try {
      // Use the async verification method
      event = await verifyStripeSignatureAsync(body, signature);
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
    
    // Initialize Supabase client
    const { supabaseClient } = createClients();

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(supabaseClient, event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(supabaseClient, event.data.object);
        break;
      
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }
    
    // Implement fallback check for all pending transactions with payment intents
    try {
      console.log('[WEBHOOK] Running pending transactions fallback check');
      const pendingTransactions = await findRecentPendingTransactions(supabaseClient);
      
      for (const tx of pendingTransactions) {
        if (tx.external_transaction_id) {
          await checkAndUpdatePayment(supabaseClient, tx);
        }
      }
    } catch (fallbackError) {
      console.error(`[WEBHOOK] Error in fallback check: ${fallbackError.message}`);
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
};
