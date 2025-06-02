
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
}

// Fetch wallet addresses from database
export const useWalletAddresses = () => {
  return useQuery({
    queryKey: ['wallet-addresses'],
    queryFn: async (): Promise<WalletAddress[]> => {
      console.log('Fetching wallet addresses from database...');
      
      const { data, error } = await supabase
        .from('client_wallet_addresses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wallet addresses:', error);
        throw new Error(`Failed to fetch wallet addresses: ${error.message}`);
      }

      console.log(`Found ${data?.length || 0} active wallet addresses`);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
