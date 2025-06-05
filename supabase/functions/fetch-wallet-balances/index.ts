
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface WalletBalance {
  wallet_address: string;
  network: string;
  currency: string;
  balance: number;
  balance_usd: number;
}

// Enhanced balance fetching with Moralis API
async function fetchMoralisNativeBalance(address: string, chain: string): Promise<number> {
  try {
    const moralisApiKey = Deno.env.get('MORALIS_API_KEY');
    if (!moralisApiKey) {
      console.log('No Moralis API key found, skipping Moralis call');
      return 0;
    }

    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=${chain}`,
      {
        headers: {
          'X-API-Key': moralisApiKey,
          'accept': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      // Convert from wei to ether (18 decimals for most chains)
      const balance = parseInt(data.balance) / Math.pow(10, 18);
      console.log(`Moralis native balance for ${address} on ${chain}: ${balance}`);
      return balance;
    } else {
      console.error(`Moralis API error for ${address}: ${response.status}`);
      return 0;
    }
  } catch (error) {
    console.error(`Error fetching Moralis native balance for ${address}:`, error);
    return 0;
  }
}

// Fetch ERC-20 token balances using Moralis
async function fetchMoralisTokenBalance(address: string, chain: string, tokenAddress: string, decimals: number): Promise<number> {
  try {
    const moralisApiKey = Deno.env.get('MORALIS_API_KEY');
    if (!moralisApiKey) {
      console.log('No Moralis API key found, skipping token balance fetch');
      return 0;
    }

    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=${chain}&token_addresses%5B0%5D=${tokenAddress}`,
      {
        headers: {
          'X-API-Key': moralisApiKey,
          'accept': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const balance = parseInt(data[0].balance) / Math.pow(10, decimals);
        console.log(`Moralis token balance for ${tokenAddress} on ${chain}: ${balance}`);
        return balance;
      }
    } else {
      console.error(`Moralis token API error for ${address}: ${response.status}`);
    }
    return 0;
  } catch (error) {
    console.error(`Error fetching Moralis token balance:`, error);
    return 0;
  }
}

// Fetch Bitcoin balance using Blockstream
async function fetchBitcoinBalance(address: string): Promise<number> {
  try {
    const response = await fetch(`https://blockstream.info/api/address/${address}`);
    
    if (response.ok) {
      const data = await response.json();
      // Convert from satoshis to BTC
      const balance = (data.chain_stats?.funded_txo_sum || 0) / Math.pow(10, 8);
      console.log(`Bitcoin balance for ${address}: ${balance}`);
      return balance;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching Bitcoin balance:', error);
    return 0;
  }
}

// Fetch Solana balance using public RPC
async function fetchSolanaBalance(address: string): Promise<number> {
  try {
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address]
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result?.value) {
        // Convert from lamports to SOL
        const balance = data.result.value / Math.pow(10, 9);
        console.log(`Solana balance for ${address}: ${balance}`);
        return balance;
      }
    }
    return 0;
  } catch (error) {
    console.error('Error fetching Solana balance:', error);
    return 0;
  }
}

// Updated to use CoinGecko API for consistent pricing with frontend
async function fetchCryptoPrices(): Promise<Record<string, number>> {
  try {
    console.log('Fetching prices from CoinGecko API...');
    
    // CoinGecko coin IDs mapping (same as frontend)
    const coinGeckoIds = [
      'bitcoin',
      'ethereum', 
      'binancecoin',
      'solana',
      'matic-network',
      'tether',
      'usd-coin',
      'binance-usd',
      'dai'
    ].join(',');

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    const prices: Record<string, number> = {};
    
    // Map CoinGecko data to our format (same as frontend)
    const symbolMap: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'solana': 'SOL',
      'matic-network': 'POL',
      'tether': 'USDT',
      'usd-coin': 'USDC',
      'binance-usd': 'BUSD',
      'dai': 'DAI'
    };
    
    // Process each cryptocurrency
    Object.entries(data).forEach(([coinId, coinData]: [string, any]) => {
      const symbol = symbolMap[coinId];
      if (symbol && coinData.usd) {
        const price = coinData.usd;
        
        if (isValidPrice(symbol, price)) {
          prices[symbol] = price;
          console.log(`✅ CoinGecko price for ${symbol}: $${price.toFixed(2)}`);
        } else {
          console.warn(`❌ Invalid price for ${symbol}: $${price}, using fallback`);
          prices[symbol] = getCurrentFallbackPrices()[symbol] || 0;
        }
      }
    });
    
    // Add MATIC as alias for POL for backward compatibility
    if (prices['POL']) {
      prices['MATIC'] = prices['POL'];
    }
    
    // Fill in missing currencies with fallback data
    const fallbackData = getCurrentFallbackPrices();
    Object.keys(fallbackData).forEach(symbol => {
      if (!prices[symbol]) {
        prices[symbol] = fallbackData[symbol];
        console.warn(`⚠️ Using fallback price for ${symbol}: $${fallbackData[symbol]}`);
      }
    });
    
    const validCount = Object.values(prices).filter(p => isValidPrice(Object.keys(prices).find(k => prices[k] === p) || '', p)).length;
    const totalCount = Object.keys(prices).length;
    
    console.log(`✅ CoinGecko pricing: ${validCount}/${totalCount} live prices fetched successfully`);
    return prices;

  } catch (error) {
    console.error('❌ Error fetching from CoinGecko:', error);
    console.log('🔄 Falling back to static prices');
    return getCurrentFallbackPrices();
  }
}

// Price validation function with updated ranges (same as frontend)
function isValidPrice(symbol: string, price: number): boolean {
  const priceRanges: Record<string, { min: number; max: number }> = {
    'BTC': { min: 90000, max: 200000 },
    'ETH': { min: 2500, max: 10000 },
    'BNB': { min: 500, max: 1500 },
    'SOL': { min: 180, max: 500 },
    'POL': { min: 0.3, max: 2.0 },
  };

  const range = priceRanges[symbol];
  if (!range) return true;

  return price >= range.min && price <= range.max;
}

// Current fallback prices (identical to frontend)
function getCurrentFallbackPrices(): Record<string, number> {
  console.log('Using current market fallback prices');
  return {
    'BTC': 104000,
    'ETH': 3800,
    'BNB': 720,
    'SOL': 250,
    'POL': 0.52,
    'MATIC': 0.52,
    'USDT': 1.0, 
    'USDC': 1.0, 
    'BUSD': 1.0, 
    'DAI': 1.0
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
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

    // Check if user is admin
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('*')
      .or(`id.eq.${user.id},email.ilike.${user.email}`)
      .maybeSingle();

    if (!adminRecord) {
      throw new Error('Admin access required');
    }

    console.log('=== Enhanced Wallet Balance Fetching with CoinGecko Pricing ===');

    // Clear existing wallet addresses and create your actual ones
    await supabase.from('client_wallet_addresses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Your actual wallet addresses for all supported networks and tokens
    const actualWallets = [
      // Ethereum network
      { wallet_address: '0x122aFBa94695Fe9E742627Cf2365De69c598F7ad', currency: 'ETH', network: 'ethereum', token_address: null },
      { wallet_address: '0x122aFBa94695Fe9E742627Cf2365De69c598F7ad', currency: 'USDT', network: 'ethereum', token_address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
      { wallet_address: '0x122aFBa94695Fe9E742627Cf2365De69c598F7ad', currency: 'USDC', network: 'ethereum', token_address: '0xa0b86a33e6ba8bc2b7c59e6b8b62e6b9ce90a78b' },
      
      // Polygon network - Updated to use POL instead of MATIC
      { wallet_address: '0x122aFBa94695Fe9E742627Cf2365De69c598F7ad', currency: 'POL', network: 'polygon', token_address: null },
      { wallet_address: '0x122aFBa94695Fe9E742627Cf2365De69c598F7ad', currency: 'USDT', network: 'polygon', token_address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' },
      { wallet_address: '0x122aFBa94695Fe9E742627Cf2365De69c598F7ad', currency: 'USDC', network: 'polygon', token_address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' },
      
      // BSC network
      { wallet_address: '0x122aFBa94695Fe9E742627Cf2365De69c598F7ad', currency: 'BNB', network: 'binance-smart-chain', token_address: null },
      { wallet_address: '0x122aFBa94695Fe9E742627Cf2365De69c598F7ad', currency: 'USDT', network: 'binance-smart-chain', token_address: '0x55d398326f99059ff775485246999027b3197955' },
      { wallet_address: '0x122aFBa94695Fe9E742627Cf2365De69c598F7ad', currency: 'USDC', network: 'binance-smart-chain', token_address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d' },
      
      // Solana network
      { wallet_address: 'ESbg8PzA6atCgaq5ZtgxQN2XcixsBzag87Ci4dNRLGjb', currency: 'SOL', network: 'solana', token_address: null },
      
      // Bitcoin network
      { wallet_address: 'bc1pqxs99swgqt9u39tt3206zfkrpscv3jk9jm2l8rdgyzznpmlwsfus6ujdc4', currency: 'BTC', network: 'bitcoin', token_address: null }
    ];

    // Insert actual wallet addresses
    const { error: insertError } = await supabase
      .from('client_wallet_addresses')
      .insert(actualWallets.map(w => ({
        wallet_address: w.wallet_address,
        currency: w.currency,
        network: w.network,
        is_active: true
      })));

    if (insertError) {
      console.error('Error inserting wallet addresses:', insertError);
    } else {
      console.log(`Inserted ${actualWallets.length} actual wallet addresses`);
    }

    // Fetch current crypto prices using CoinGecko (same as frontend)
    const prices = await fetchCryptoPrices();

    const balances: WalletBalance[] = [];

    // Process each wallet with enhanced logic
    for (const wallet of actualWallets) {
      try {
        let balance = 0;

        console.log(`Fetching balance for ${wallet.currency} on ${wallet.network}`);

        // Fetch balances based on network and token type
        if (wallet.token_address) {
          // ERC-20 token balance
          const decimals = wallet.currency === 'USDT' ? 6 : 18; // USDT typically uses 6 decimals
          
          switch (wallet.network) {
            case 'ethereum':
              balance = await fetchMoralisTokenBalance(wallet.wallet_address, 'eth', wallet.token_address, decimals);
              break;
            case 'polygon':
              balance = await fetchMoralisTokenBalance(wallet.wallet_address, 'polygon', wallet.token_address, decimals);
              break;
            case 'binance-smart-chain':
              balance = await fetchMoralisTokenBalance(wallet.wallet_address, 'bsc', wallet.token_address, decimals);
              break;
          }
        } else {
          // Native token balance
          switch (wallet.network) {
            case 'ethereum':
              balance = await fetchMoralisNativeBalance(wallet.wallet_address, 'eth');
              break;
            case 'polygon':
              balance = await fetchMoralisNativeBalance(wallet.wallet_address, 'polygon');
              break;
            case 'binance-smart-chain':
              balance = await fetchMoralisNativeBalance(wallet.wallet_address, 'bsc');
              break;
            case 'solana':
              balance = await fetchSolanaBalance(wallet.wallet_address);
              break;
            case 'bitcoin':
              balance = await fetchBitcoinBalance(wallet.wallet_address);
              break;
            default:
              console.warn(`Unsupported network: ${wallet.network}`);
              continue;
          }
        }

        const price = prices[wallet.currency] || 0;
        const balanceUsd = balance * price;

        const walletBalance: WalletBalance = {
          wallet_address: wallet.wallet_address,
          network: wallet.network,
          currency: wallet.currency,
          balance: balance,
          balance_usd: balanceUsd
        };

        balances.push(walletBalance);

        console.log(`${wallet.currency} (${wallet.network}): ${balance.toFixed(6)} ($${balanceUsd.toFixed(2)} @ $${price})`);

        // Upsert balance to database
        const { error: upsertError } = await supabase
          .from('wallet_balances')
          .upsert(walletBalance, {
            onConflict: 'wallet_address,network,currency'
          });

        if (upsertError) {
          console.error(`Error upserting balance for ${wallet.currency}:`, upsertError);
        }

      } catch (error) {
        console.error(`Error processing wallet ${wallet.currency} on ${wallet.network}:`, error);
      }
    }

    const totalUsd = balances.reduce((sum, b) => sum + b.balance_usd, 0);
    
    console.log(`=== Portfolio Summary with CoinGecko Pricing ===`);
    console.log(`Total wallets processed: ${balances.length}`);
    console.log(`Total USD value: $${totalUsd.toFixed(2)}`);

    return new Response(JSON.stringify({
      success: true,
      balances,
      summary: {
        total_wallets: balances.length,
        total_usd_value: totalUsd,
        updated_at: new Date().toISOString()
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in fetch-wallet-balances:', error);
    
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
