
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
      const { data, error } = await supabase
        .from('wallet_balances')
        .select('*')
        .order('last_updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch wallet balances: ${error.message}`);
      }

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
      const { data, error } = await supabase.functions.invoke('fetch-wallet-balances');

      if (error) {
        throw new Error(`Failed to refresh balances: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to refresh balances');
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch wallet balances
      queryClient.invalidateQueries({ queryKey: ['wallet-balances'] });
      toast.success('Wallet balances refreshed successfully');
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
