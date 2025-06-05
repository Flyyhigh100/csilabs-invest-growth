
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WalletAddress {
  id: string;
  wallet_address: string;
  network: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  token_address?: string; // Add support for token contract addresses
}

// Fetch wallet addresses from database with enhanced network display
export const useWalletAddresses = () => {
  return useQuery({
    queryKey: ['wallet-addresses'],
    queryFn: async (): Promise<WalletAddress[]> => {
      console.log('Fetching enhanced wallet addresses from database...');
      
      const { data, error } = await supabase
        .from('client_wallet_addresses')
        .select('*')
        .eq('is_active', true)
        .order('network', { ascending: true })
        .order('currency', { ascending: true });

      if (error) {
        console.error('Error fetching wallet addresses:', error);
        throw new Error(`Failed to fetch wallet addresses: ${error.message}`);
      }

      console.log(`Found ${data?.length || 0} active wallet addresses across multiple networks`);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Helper function to get network display information
export const getNetworkInfo = (network: string) => {
  const networkMap: Record<string, { name: string; color: string; explorer: string }> = {
    'ethereum': { 
      name: 'Ethereum', 
      color: 'bg-blue-100 text-blue-800', 
      explorer: 'https://etherscan.io/address/' 
    },
    'polygon': { 
      name: 'Polygon', 
      color: 'bg-purple-100 text-purple-800', 
      explorer: 'https://polygonscan.com/address/' 
    },
    'binance-smart-chain': { 
      name: 'BSC', 
      color: 'bg-yellow-100 text-yellow-800', 
      explorer: 'https://bscscan.com/address/' 
    },
    'solana': { 
      name: 'Solana', 
      color: 'bg-green-100 text-green-800', 
      explorer: 'https://solscan.io/account/' 
    },
    'bitcoin': { 
      name: 'Bitcoin', 
      color: 'bg-orange-100 text-orange-800', 
      explorer: 'https://blockchair.com/bitcoin/address/' 
    }
  };
  
  return networkMap[network] || { 
    name: network, 
    color: 'bg-gray-100 text-gray-800', 
    explorer: '' 
  };
};

// Helper function to get currency display information
export const getCurrencyInfo = (currency: string) => {
  const currencyMap: Record<string, { isStablecoin: boolean; type: string }> = {
    'BTC': { isStablecoin: false, type: 'native' },
    'ETH': { isStablecoin: false, type: 'native' },
    'MATIC': { isStablecoin: false, type: 'native' },
    'BNB': { isStablecoin: false, type: 'native' },
    'SOL': { isStablecoin: false, type: 'native' },
    'USDT': { isStablecoin: true, type: 'token' },
    'USDC': { isStablecoin: true, type: 'token' },
    'BUSD': { isStablecoin: true, type: 'token' },
    'DAI': { isStablecoin: true, type: 'token' }
  };
  
  return currencyMap[currency] || { isStablecoin: false, type: 'unknown' };
};
