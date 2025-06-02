
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WalletBalance {
  id: string;
  wallet_address: string;
  network: string;
  currency: string;
  balance: number;
  balance_usd: number;
  last_updated_at: string;
  created_at: string;
}

export interface WalletPortfolioSummary {
  total_wallets: number;
  total_usd_value: number;
  balances_by_currency: Record<string, { balance: number; balance_usd: number }>;
  last_updated: string | null;
}

// Fetch wallet balances from database
export const useWalletBalances = () => {
  return useQuery({
    queryKey: ['wallet-balances'],
    queryFn: async (): Promise<WalletBalance[]> => {
      console.log('Fetching wallet balances from database...');
      
      const { data, error } = await supabase
        .from('wallet_balances')
        .select('*')
        .order('last_updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching wallet balances:', error);
        throw new Error(`Failed to fetch wallet balances: ${error.message}`);
      }

      console.log(`Found ${data?.length || 0} wallet balance records`);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Refresh wallet balances by calling the edge function
export const useRefreshWalletBalances = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('Calling fetch-wallet-balances edge function...');
      
      const { data, error } = await supabase.functions.invoke('fetch-wallet-balances');

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to refresh balances: ${error.message}`);
      }

      if (!data?.success) {
        console.error('Edge function returned unsuccessful result:', data);
        throw new Error(data?.error || 'Failed to refresh balances');
      }

      console.log('Successfully refreshed wallet balances:', data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch wallet balances
      queryClient.invalidateQueries({ queryKey: ['wallet-balances'] });
      
      const summary = data?.summary;
      if (summary) {
        toast.success(`Wallet balances refreshed successfully`, {
          description: `${summary.total_wallets} wallets processed, $${summary.total_usd_value.toFixed(2)} total value`
        });
      } else {
        toast.success('Wallet balances refreshed successfully');
      }
    },
    onError: (error: Error) => {
      console.error('Error refreshing wallet balances:', error);
      toast.error('Failed to refresh wallet balances', {
        description: error.message
      });
    },
  });
};

// Calculate portfolio summary from wallet balances
export const useWalletPortfolioSummary = () => {
  const { data: balances, isLoading, error } = useWalletBalances();

  const summary: WalletPortfolioSummary | null = balances ? {
    total_wallets: balances.length,
    total_usd_value: balances.reduce((sum, balance) => sum + balance.balance_usd, 0),
    balances_by_currency: balances.reduce((acc, balance) => {
      if (!acc[balance.currency]) {
        acc[balance.currency] = { balance: 0, balance_usd: 0 };
      }
      acc[balance.currency].balance += balance.balance;
      acc[balance.currency].balance_usd += balance.balance_usd;
      return acc;
    }, {} as Record<string, { balance: number; balance_usd: number }>),
    last_updated: balances.length > 0 
      ? balances.reduce((latest, balance) => 
          balance.last_updated_at > latest ? balance.last_updated_at : latest, 
          balances[0].last_updated_at
        )
      : null
  } : null;

  return {
    data: summary,
    isLoading,
    error
  };
};
