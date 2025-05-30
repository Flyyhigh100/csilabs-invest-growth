
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface DirectPaymentRequest {
  amount: number;
  network: 'polygon' | 'solana';
  currency: 'USDT' | 'USDC';
  wallet_address: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { amount, network, currency, wallet_address }: DirectPaymentRequest = await req.json();

    // Validate input
    if (!amount || amount < 1) {
      throw new Error('Invalid amount: minimum $1 required');
    }

    if (!['polygon', 'solana'].includes(network)) {
      throw new Error('Invalid network: must be polygon or solana');
    }

    if (!['USDT', 'USDC'].includes(currency)) {
      throw new Error('Invalid currency: must be USDT or USDC');
    }

    if (!wallet_address) {
      throw new Error('Wallet address is required');
    }

    console.log(`Creating direct crypto payment: $${amount} ${currency} on ${network} for user ${user.id}`);

    // Get the company wallet address for the selected network/currency
    const { data: clientWallet, error: walletError } = await supabase
      .from('client_wallet_addresses')
      .select('wallet_address')
      .eq('network', network)
      .eq('currency', currency)
      .eq('is_active', true)
      .single();

    if (walletError || !clientWallet) {
      throw new Error(`No active wallet found for ${currency} on ${network}`);
    }

    // For direct crypto payments, we use 1:1 USD conversion for stablecoins
    // This assumes USDT/USDC are worth $1 each (which is their intended peg)
    const expectedCryptoAmount = amount;

    // Set payment timeout (5 minutes from now - reduced from 30 minutes)
    const timeoutAt = new Date();
    timeoutAt.setMinutes(timeoutAt.getMinutes() + 5);

    // Generate transaction ID
    const transactionId = `direct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_id: transactionId,
        amount: amount,
        payment_method: 'direct_crypto',
        status: 'pending',
        wallet_address: wallet_address,
        payment_address: clientWallet.wallet_address,
        crypto_network: network,
        crypto_currency_symbol: currency,
        expected_crypto_amount: expectedCryptoAmount,
        payment_timeout_at: timeoutAt.toISOString(),
        currency: 'USD',
        is_test: false
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError);
      throw new Error(`Failed to create transaction: ${txError.message}`);
    }

    console.log(`Direct crypto payment created successfully: ${transactionId}`);

    // Notify admins about new direct crypto payment
    try {
      await supabase.functions.invoke('admin-notifications', {
        body: {
          type: 'direct_crypto_payment',
          title: 'New Direct Crypto Payment',
          message: `New direct crypto payment of $${amount} ${currency} on ${network}`,
          transaction_id: transactionId,
          user_id: user.id
        }
      });
    } catch (notifError) {
      console.error('Failed to send admin notification:', notifError);
      // Don't fail the payment creation if notification fails
    }

    const response = {
      success: true,
      payment: {
        transaction_id: transactionId,
        payment_address: clientWallet.wallet_address,
        expected_crypto_amount: expectedCryptoAmount,
        timeout_at: timeoutAt.toISOString(),
        network: network,
        currency: currency
      }
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in create-direct-crypto-payment:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
