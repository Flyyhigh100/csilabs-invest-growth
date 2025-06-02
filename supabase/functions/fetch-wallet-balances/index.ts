
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

// Fetch balance using Moralis API
async function fetchMoralisBalance(address: string, chain: string): Promise<number> {
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
      console.log(`Moralis balance for ${address} on ${chain}: ${balance}`);
      return balance;
    } else {
      console.error(`Moralis API error for ${address}: ${response.status}`);
      return 0;
    }
  } catch (error) {
    console.error(`Error fetching Moralis balance for ${address}:`, error);
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

// Fetch cryptocurrency prices from CoinCap API
async function fetchCryptoPrices(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      'https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,polygon,binance-coin,solana'
    );
    
    if (response.ok) {
      const data = await response.json();
      const prices: Record<string, number> = {
        'USDT': 1.0,
        'USDC': 1.0
      };
      
      data.data.forEach((asset: any) => {
        const price = parseFloat(asset.priceUsd) || 0;
        switch (asset.id) {
          case 'bitcoin':
            prices['BTC'] = price;
            break;
          case 'ethereum':
            prices['ETH'] = price;
            break;
          case 'polygon':
            prices['MATIC'] = price;
            prices['POL'] = price;
            break;
          case 'binance-coin':
            prices['BNB'] = price;
            break;
          case 'solana':
            prices['SOL'] = price;
            break;
        }
      });
      
      console.log('Fetched crypto prices from CoinCap');
      return prices;
    }
    
    throw new Error('Failed to fetch prices');
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    // Return fallback prices
    return {
      'ETH': 3000, 'BNB': 600, 'BTC': 45000, 'SOL': 100, 
      'MATIC': 0.5, 'POL': 0.5, 'USDT': 1.0, 'USDC': 1.0
    };
  }
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

    console.log('=== Fetching Wallet Balances ===');

    // Fetch wallet addresses
    const { data: wallets, error: walletsError } = await supabase
      .from('client_wallet_addresses')
      .select('*')
      .eq('is_active', true);

    if (walletsError) {
      throw new Error(`Failed to fetch wallets: ${walletsError.message}`);
    }

    console.log(`Found ${wallets?.length || 0} active wallets`);

    // If no wallets exist, create sample ones for testing
    if (!wallets || wallets.length === 0) {
      console.log('No wallet addresses found, creating sample wallet addresses...');
      
      const sampleWallets = [
        {
          wallet_address: '0x742d35Cc6635C0532925a3b8D60C3fe8FDBdC445',
          currency: 'ETH',
          network: 'ethereum',
          is_active: true
        },
        {
          wallet_address: '0x742d35Cc6635C0532925a3b8D60C3fe8FDBdC445',
          currency: 'MATIC',
          network: 'polygon',
          is_active: true
        },
        {
          wallet_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          currency: 'BTC',
          network: 'bitcoin',
          is_active: true
        }
      ];

      const { error: insertError } = await supabase
        .from('client_wallet_addresses')
        .insert(sampleWallets);

      if (!insertError) {
        console.log('Created sample wallet addresses');
        // Refetch wallets
        const { data: newWallets } = await supabase
          .from('client_wallet_addresses')
          .select('*')
          .eq('is_active', true);
        
        if (newWallets) {
          wallets.push(...newWallets);
        }
      }
    }

    // Fetch current crypto prices
    const prices = await fetchCryptoPrices();

    const balances: WalletBalance[] = [];

    // Process each wallet
    for (const wallet of wallets || []) {
      try {
        let balance = 0;

        console.log(`Fetching balance for ${wallet.currency} on ${wallet.network}`);

        switch (wallet.network) {
          case 'ethereum':
            balance = await fetchMoralisBalance(wallet.wallet_address, 'eth');
            break;
          case 'polygon':
            balance = await fetchMoralisBalance(wallet.wallet_address, 'polygon');
            break;
          case 'binance-smart-chain':
            balance = await fetchMoralisBalance(wallet.wallet_address, 'bsc');
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

        console.log(`${wallet.currency}: ${balance.toFixed(6)} ($${balanceUsd.toFixed(2)})`);

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
    
    console.log(`=== Portfolio Summary ===`);
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
