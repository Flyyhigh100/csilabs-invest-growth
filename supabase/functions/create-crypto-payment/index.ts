
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

    // For testing purposes, we'll simulate a crypto payment process
    // In production, you would integrate with a real crypto payment processor
    
    // Generate a payment address (in production, this would be a real address)
    const paymentAddress = "0x" + Array(40).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)).join('');
      
    // Generate a unique transaction ID
    const transactionId = crypto.randomUUID();

    // Log the transaction in your database
    await supabaseClient.from('transactions').insert({
      user_id: user.id,
      amount: amount,
      wallet_address: walletAddress,
      payment_method: 'crypto',
      status: 'pending',
      transaction_id: transactionId,
      payment_address: paymentAddress
    });

    return new Response(
      JSON.stringify({ 
        paymentAddress: paymentAddress,
        amount: amount,
        transactionId: transactionId,
        instructions: "Send USDC tokens to this address to complete your purchase. For testing, no actual payment is required." 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating crypto payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
