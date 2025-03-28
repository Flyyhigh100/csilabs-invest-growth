
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
  
  if (!amount || amount <= 0 || !walletAddress) {
    return new Response(
      JSON.stringify({ error: 'Invalid amount or missing wallet address' }),
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
    console.log(`Amount: $${amount}, Wallet: ${walletAddress}`);

    // Calculate token amount (1:1 ratio with USD for simplicity)
    const tokenAmount = amount;
    
    // Create a Stripe checkout session with your specific price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CSi Tokens',
              description: `${tokenAmount} CSi Tokens`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/dashboard/transactions?success=true`,
      cancel_url: `${req.headers.get('origin')}/dashboard/transactions?canceled=true`,
      metadata: {
        user_id: user.id,
        wallet_address: walletAddress,
        token_amount: tokenAmount.toString(),
      },
    });

    console.log('Checkout session created:', session.id);

    // Log the transaction in your database
    const { error: insertError } = await supabaseClient.from('transactions').insert({
      user_id: user.id,
      amount: amount,
      wallet_address: walletAddress,
      payment_method: 'stripe',
      status: 'pending',
      transaction_id: session.id,
    });

    if (insertError) {
      console.error('Error inserting transaction record:', insertError);
      throw new Error('Failed to record transaction');
    }

    // Send notification to CEO about the new transaction
    try {
      // Get user profile information
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      
      const userName = profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Unknown User';
      
      // Call the transaction alert function
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-transaction-alert`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({
            transactionId: session.id,
            amount,
            walletAddress,
            paymentMethod: 'stripe',
            status: 'pending',
            email: user.email,
            name: userName
          }),
        }
      );
    } catch (notificationError) {
      // Don't fail the transaction if notification fails
      console.error('Error sending transaction notification:', notificationError);
    }

    return new Response(
      JSON.stringify({ url: session.url }),
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
