
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Error getting user or user not found');
    }

    // Initialize Stripe with your secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      throw new Error('Stripe configuration error');
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Creating Stripe checkout session...');
    console.log(`Amount: $${amount}, Wallet: ${walletAddress}, User ID: ${user.id}`);

    // Use dynamic pricing based on user input instead of fixed price
    const unitAmount = Math.round(amount * 100); // Convert to cents for Stripe
    
    // Include the auth token in the success/cancel URLs to maintain the session
    const origin = req.headers.get('origin') || '';
    
    // Improved URL structure to maintain session - avoid using token directly in URL
    // Instead, use session cookies that will be transferred automatically
    const successUrl = `${origin}/dashboard/transactions?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/dashboard/transactions?canceled=true&session_id={CHECKOUT_SESSION_ID}`;
    
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
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        wallet_address: walletAddress,
        product_id: 'prod_S5gefbBmLHAKG2', // Your specific product ID
        amount: amount.toString(), // Store the original amount in metadata
        auth_token: token.substring(0, 10) + '...' // Store first few chars of token for debugging (not the full token)
      },
    });

    console.log('Checkout session created:', session.id);

    // Calculate the actual amount from the session for record keeping
    const sessionAmount = session.amount_total ? session.amount_total / 100 : amount;

    // Log the transaction in your database
    const { error: insertError } = await supabaseClient.from('transactions').insert({
      user_id: user.id,
      amount: sessionAmount,
      wallet_address: walletAddress,
      payment_method: 'stripe',
      status: 'pending',
      transaction_id: session.id,
    });

    if (insertError) {
      console.error('Error inserting transaction record:', insertError);
      throw new Error('Failed to record transaction');
    }

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id,
        user_id: user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
