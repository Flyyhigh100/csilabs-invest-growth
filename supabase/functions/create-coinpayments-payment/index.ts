
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';
const COINPAYMENTS_PUBLIC_KEY = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
const COINPAYMENTS_PRIVATE_KEY = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');

// Helper function to create HMAC signature
function createSignature(params: Record<string, string>, privateKey: string): string {
  const payload = new URLSearchParams(params).toString();
  const encoder = new TextEncoder();
  const key = encoder.encode(privateKey);
  const message = encoder.encode(payload);
  
  // Create HMAC using SubtleCrypto API
  const hmacDigest = crypto.subtle.digestSync("HMAC", key, message);
  
  // Convert to hex string
  return Array.from(new Uint8Array(hmacDigest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper function to make CoinPayments API request
async function coinPaymentsRequest(command: string, params: Record<string, string>) {
  if (!COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
    throw new Error('CoinPayments API keys are not configured');
  }

  const requestParams = {
    cmd: command,
    key: COINPAYMENTS_PUBLIC_KEY,
    version: '1',
    format: 'json',
    ...params,
  };

  const hmacSig = createSignature(requestParams, COINPAYMENTS_PRIVATE_KEY);

  console.log(`Making CoinPayments API request for command: ${command}`);
  
  const response = await fetch(COINPAYMENTS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'HMAC': hmacSig,
    },
    body: new URLSearchParams(requestParams),
  });

  const data = await response.json();
  if (data.error !== 'ok') {
    console.error('CoinPayments API error:', data.error);
    throw new Error(`CoinPayments API error: ${data.error}`);
  }

  return data.result;
}

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

    console.log(`Creating CoinPayments payment for amount: $${amount}, wallet: ${walletAddress}`);
    
    // Create Supabase client to record the transaction
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the user from the authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Error getting user or user not found');
    }

    // Generate a unique transaction ID
    const transactionId = crypto.randomUUID();

    // For testing purposes, create a mock payment without actually calling the API
    // Remove this for production and uncomment the actual API call below
    const mockPaymentData = {
      address: `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      amount: amount.toString(),
      txn_id: `CP${Date.now()}`,
      timeout: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      qrcode_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ethereum:0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      status_url: `https://www.coinpayments.net/index.php?cmd=status&id=CP${Date.now()}`
    };
    
    // In production, uncomment the below code to make the actual API call:
    /*
    // Create a new transaction in CoinPayments
    const createTransactionParams = {
      amount: amount.toString(),
      currency1: 'USD',
      currency2: currency,
      buyer_email: user.email || 'customer@example.com',
      item_name: 'CSi Tokens Purchase',
      item_number: transactionId,
      custom: walletAddress, // Store wallet address in custom field
      ipn_url: `${Deno.env.get('SUPABASE_FUNCTIONS_URL')}/ipn-handler`, // This would be implemented separately
    };

    const paymentData = await coinPaymentsRequest('create_transaction', createTransactionParams);
    */
    
    // Use the mock data for now
    const paymentData = mockPaymentData;
    
    // Log the transaction in the transactions table
    const { error: insertError } = await supabaseClient.from('transactions').insert({
      user_id: user.id,
      amount: amount,
      wallet_address: walletAddress,
      payment_method: 'coinpayments',
      status: 'pending',
      transaction_id: transactionId,
      payment_address: paymentData.address,
      external_transaction_id: paymentData.txn_id
    });

    if (insertError) {
      console.error('Error inserting transaction record:', insertError);
      throw new Error('Failed to record transaction');
    }

    console.log(`CoinPayments payment created with ID: ${paymentData.txn_id}`);

    return new Response(
      JSON.stringify({
        paymentAddress: paymentData.address,
        amount: paymentData.amount,
        transactionId: transactionId,
        externalTransactionId: paymentData.txn_id,
        qrCodeUrl: paymentData.qrcode_url,
        statusUrl: paymentData.status_url,
        expiresAt: new Date(paymentData.timeout * 1000).toISOString(),
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
