
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WalletTransaction {
  id: string;
  wallet_address: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  transaction_id: string;
  user_id: string;
}

export interface WalletLastTransaction {
  wallet_address: string;
  last_transaction: WalletTransaction | null;
}

// Hook to fetch the last transaction for each wallet address
export const useWalletLastTransactions = () => {
  return useQuery({
    queryKey: ['wallet-last-transactions'],
    queryFn: async (): Promise<WalletLastTransaction[]> => {
      console.log('Fetching last transactions for each wallet address...');

      // First get all unique wallet addresses from client_wallet_addresses
      const { data: walletAddresses, error: walletError } = await supabase
        .from('client_wallet_addresses')
        .select('wallet_address')
        .eq('is_active', true);

      if (walletError) {
        console.error('Error fetching wallet addresses:', walletError);
        throw new Error(`Failed to fetch wallet addresses: ${walletError.message}`);
      }

      const uniqueAddresses = [...new Set(walletAddresses?.map(w => w.wallet_address) || [])];
      const walletTransactions: WalletLastTransaction[] = [];

      // For each wallet address, get the most recent transaction
      for (const address of uniqueAddresses) {
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select(`
            id,
            wallet_address,
            amount,
            currency,
            status,
            payment_method,
            created_at,
            transaction_id,
            user_id
          `)
          .eq('wallet_address', address)
          .order('created_at', { ascending: false })
          .limit(1);

        if (txError) {
          console.error(`Error fetching transactions for ${address}:`, txError);
          walletTransactions.push({
            wallet_address: address,
            last_transaction: null
          });
        } else {
          walletTransactions.push({
            wallet_address: address,
            last_transaction: transactions?.[0] || null
          });
        }
      }

      console.log(`Found last transactions for ${walletTransactions.length} wallet addresses`);
      return walletTransactions;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};

// Hook to fetch transactions for a specific wallet address
export const useWalletTransactions = (walletAddress: string) => {
  return useQuery({
    queryKey: ['wallet-transactions', walletAddress],
    queryFn: async (): Promise<WalletTransaction[]> => {
      console.log(`Fetching transactions for wallet: ${walletAddress}`);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          wallet_address,
          amount,
          currency,
          status,
          payment_method,
          created_at,
          transaction_id,
          user_id
        `)
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error(`Error fetching transactions for ${walletAddress}:`, error);
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return transactions || [];
    },
    enabled: !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};
