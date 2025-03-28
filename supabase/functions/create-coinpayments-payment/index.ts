
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { corsHeaders } from "./utils.ts";
import { createCoinPaymentsTransaction } from "./api-client.ts";
import { createSupabaseClient, saveTransaction } from "./db-client.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Add authorization header verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get request data
    const { amount, walletAddress, currency = 'USDT' } = await req.json();
    
    if (!amount || amount <= 0 || !walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount or missing wallet address' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Creating CoinPayments payment for amount: $${amount}, wallet: ${walletAddress}, currency: ${currency}`);
    
    // Create Supabase client to record the transaction
    const supabaseClient = createSupabaseClient();

    // Get the user from the authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Error getting user or user not found');
    }

    // Generate a unique transaction ID
    const transactionId = crypto.randomUUID();

    // Create a new transaction in CoinPayments API
    const paymentData = await createCoinPaymentsTransaction(
      amount, 
      currency, 
      transactionId, 
      walletAddress, 
      user.email
    );

    try {
      // Save transaction to database
      await saveTransaction(
        supabaseClient,
        user.id,
        amount,
        walletAddress,
        transactionId,
        paymentData.address,
        paymentData.txn_id,
        currency
      );
    } catch (dbError) {
      // Continue without failing - we'll still return the payment details
      console.log('Continuing despite database error');
    }

    return new Response(
      JSON.stringify({
        paymentAddress: paymentData.address,
        amount: paymentData.amount,
        transactionId: transactionId,
        externalTransactionId: paymentData.txn_id,
        qrCodeUrl: paymentData.qrcode_url,
        statusUrl: paymentData.status_url,
        expiresAt: new Date(paymentData.timeout * 1000).toISOString(),
        currency: currency,
        instructions: `Please send ${paymentData.amount} ${currency} to the address above to complete your purchase.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating CoinPayments payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
