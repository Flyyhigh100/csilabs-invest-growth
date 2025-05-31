
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface DirectPaymentRequest {
  amount: number;
  network: 'polygon' | 'solana' | 'ethereum' | 'binance-smart-chain' | 'bitcoin';
  currency: 'USDT' | 'USDC' | 'ETH' | 'BNB' | 'BTC';
  wallet_address: string;
}

// Fetch cryptocurrency price from CoinGecko
async function fetchCryptoPrice(symbol: string): Promise<number> {
  try {
    const coinGeckoIds: Record<string, string> = {
      'ETH': 'ethereum',
      'BNB': 'binancecoin', 
      'BTC': 'bitcoin',
      'USDT': 'tether',
      'USDC': 'usd-coin'
    };

    const coinId = coinGeckoIds[symbol];
    if (!coinId) {
      throw new Error(`Unsupported cryptocurrency: ${symbol}`);
    }

    // For stablecoins, return 1.0
    if (symbol === 'USDT' || symbol === 'USDC') {
      return 1.0;
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${symbol}`);
    }

    const data = await response.json();
    const price = data[coinId]?.usd;

    if (!price) {
      throw new Error(`Price not found for ${symbol}`);
    }

    console.log(`Fetched ${symbol} price: $${price}`);
    return price;
  } catch (error) {
    console.error(`Error fetching ${symbol} price:`, error);
    // Fallback prices if API fails
    const fallbackPrices: Record<string, number> = {
      'ETH': 3000,
      'BNB': 600,
      'BTC': 45000,
      'USDT': 1.0,
      'USDC': 1.0
    };
    return fallbackPrices[symbol] || 1.0;
  }
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

    const validNetworks = ['polygon', 'solana', 'ethereum', 'binance-smart-chain', 'bitcoin'];
    if (!validNetworks.includes(network)) {
      throw new Error(`Invalid network: must be one of ${validNetworks.join(', ')}`);
    }

    const validCurrencies = ['USDT', 'USDC', 'ETH', 'BNB', 'BTC'];
    if (!validCurrencies.includes(currency)) {
      throw new Error(`Invalid currency: must be one of ${validCurrencies.join(', ')}`);
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

    // Fetch current cryptocurrency price and calculate expected amount
    const cryptoPrice = await fetchCryptoPrice(currency);
    const expectedCryptoAmount = amount / cryptoPrice;

    console.log(`Price conversion: $${amount} USD = ${expectedCryptoAmount} ${currency} (price: $${cryptoPrice})`);

    // Set payment timeout (30 minutes for volatile cryptos, 5 minutes for stablecoins)
    const isStablecoin = ['USDT', 'USDC'].includes(currency);
    const timeoutMinutes = isStablecoin ? 5 : 30;
    const timeoutAt = new Date();
    timeoutAt.setMinutes(timeoutAt.getMinutes() + timeoutMinutes);

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
          message: `New direct crypto payment of $${amount} (${expectedCryptoAmount.toFixed(6)} ${currency}) on ${network}`,
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
