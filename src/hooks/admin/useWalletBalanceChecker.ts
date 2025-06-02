
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BalanceCheckResult {
  address: string;
  network: string;
  currency: string;
  balance: number;
  price: number;
  usdValue: number;
  lastChecked: string;
}

export const useWalletBalanceChecker = (walletAddress?: string, network?: string) => {
  return useQuery({
    queryKey: ['wallet-balance-check', walletAddress, network],
    queryFn: async (): Promise<BalanceCheckResult | null> => {
      if (!walletAddress || !network) return null;

      console.log(`Checking balance for ${walletAddress} on ${network}`);
      
      // This is a simplified balance checker that uses the refresh function
      const { data, error } = await supabase.functions.invoke('fetch-wallet-balances');
      
      if (error) {
        console.error('Error checking wallet balance:', error);
        throw error;
      }

      // Find the specific wallet in the response
      const walletBalance = data?.balances?.find((b: any) => 
        b.wallet_address === walletAddress && b.network === network
      );

      if (walletBalance) {
        return {
          address: walletBalance.wallet_address,
          network: walletBalance.network,
          currency: walletBalance.currency,
          balance: walletBalance.balance,
          price: walletBalance.balance_usd / walletBalance.balance || 0,
          usdValue: walletBalance.balance_usd,
          lastChecked: new Date().toISOString()
        };
      }

      return null;
    },
    enabled: !!walletAddress && !!network,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1
  });
};
