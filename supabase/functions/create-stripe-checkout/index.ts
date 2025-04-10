import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get request data
  const { amount, walletAddress } = await req.json();
  
  if (!walletAddress) {
    return new Response(
      JSON.stringify({ error: 'Missing wallet address' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    console.log('[CHECKOUT] Starting checkout process', { amount, walletAddress });
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[CHECKOUT] No authorization header');
      throw new Error('No authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[CHECKOUT] Error getting user or user not found', userError);
      throw new Error('Error getting user or user not found');
    }

    console.log('[CHECKOUT] User found:', user.id);

    // Initialize Stripe with your secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('[CHECKOUT] STRIPE_SECRET_KEY is not set in environment variables');
      throw new Error('Stripe configuration error');
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    console.log('[CHECKOUT] Creating Stripe checkout session...');
    console.log(`[CHECKOUT] Amount: $${amount}, Wallet: ${walletAddress}, User ID: ${user.id}`);

    // Use dynamic pricing based on user input instead of fixed price
    const unitAmount = Math.round(amount * 100); // Convert to cents for Stripe
    
    const origin = req.headers.get('origin') || '';
    
    // Create a checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: 'prod_S5gefbBmLHAKG2', // Your specific product ID
            unit_amount: unitAmount, // Dynamic amount from user input
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard/transactions?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/transactions?canceled=true&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        user_id: user.id,
        wallet_address: walletAddress,
        amount: amount.toString(),
        auth_token_hash: token.substring(0, 8) // Store a hash of token for debugging (not the full token)
      },
      client_reference_id: user.id,
    });

    console.log('[CHECKOUT] Checkout session created:', session.id);
    console.log('[CHECKOUT] Payment intent created:', session.payment_intent);

    // Calculate the actual amount from the session for record keeping
    const sessionAmount = session.amount_total ? session.amount_total / 100 : amount;

    // Log the transaction in your database
    const { data: transaction, error: insertError } = await supabaseClient.from('transactions').insert({
      user_id: user.id,
      amount: sessionAmount,
      wallet_address: walletAddress,
      payment_method: 'stripe',
      status: 'pending',
      transaction_id: session.id,
      external_transaction_id: session.payment_intent || null,
    }).select().single();

    if (insertError) {
      console.error('[CHECKOUT] Error inserting transaction record:', insertError);
      throw new Error('Failed to record transaction');
    }

    console.log('[CHECKOUT] Transaction record created:', transaction.id);
    console.log('[CHECKOUT] Returning checkout URL');

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id,
        user_id: user.id,
        payment_intent: session.payment_intent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('[CHECKOUT] Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
