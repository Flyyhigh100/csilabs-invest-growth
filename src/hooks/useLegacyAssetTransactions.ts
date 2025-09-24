import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface LegacyAssetTransaction {
  id: string;
  user_id: string;
  asset_type: string;
  transaction_type: 'purchase' | 'sale' | 'transfer_in' | 'transfer_out';
  transaction_date: string;
  shares_quantity: number;
  price_per_share: number;
  total_value: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'purchase' | 'sale' | 'transfer_in' | 'transfer_out';

export const useLegacyAssetTransactions = (assetType?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch transactions for a specific asset type or all transactions
  const { 
    data: transactions, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['legacy-asset-transactions', user?.id, assetType],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('user_legacy_asset_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (assetType) {
        query = query.eq('asset_type', assetType);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching legacy asset transactions:', error);
        throw error;
      }
      
      return data as LegacyAssetTransaction[];
    },
    enabled: !!user,
  });

  // Add new transaction
  const addTransaction = useMutation({
    mutationFn: async (transaction: {
      assetType: string;
      transactionType: TransactionType;
      transactionDate: string;
      sharesQuantity: number;
      pricePerShare: number;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_legacy_asset_transactions')
        .insert({
          user_id: user.id,
          asset_type: transaction.assetType,
          transaction_type: transaction.transactionType,
          transaction_date: transaction.transactionDate,
          shares_quantity: transaction.sharesQuantity,
          price_per_share: transaction.pricePerShare,
          notes: transaction.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legacy-asset-transactions'] });
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    }
  });

  // Update transaction
  const updateTransaction = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<LegacyAssetTransaction, 'transaction_type' | 'transaction_date' | 'shares_quantity' | 'price_per_share' | 'notes'>>
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_legacy_asset_transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legacy-asset-transactions'] });
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    }
  });

  // Delete transaction
  const deleteTransaction = useMutation({
    mutationFn: async (transactionId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_legacy_asset_transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legacy-asset-transactions'] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  });

  // Helper function to calculate total shares for an asset type
  const getTotalShares = (assetType: string): number => {
    if (!transactions) return 0;
    
    return transactions
      .filter(t => t.asset_type === assetType)
      .reduce((total, transaction) => {
        if (transaction.transaction_type === 'purchase' || transaction.transaction_type === 'transfer_in') {
          return total + transaction.shares_quantity;
        } else {
          return total - transaction.shares_quantity;
        }
      }, 0);
  };

  // Helper function to calculate average cost basis
  const getAverageCostBasis = (assetType: string): number => {
    if (!transactions) return 0;
    
    const purchases = transactions
      .filter(t => t.asset_type === assetType && (t.transaction_type === 'purchase' || t.transaction_type === 'transfer_in'))
      .reduce((acc, t) => ({
        totalShares: acc.totalShares + t.shares_quantity,
        totalValue: acc.totalValue + t.total_value
      }), { totalShares: 0, totalValue: 0 });

    return purchases.totalShares > 0 ? purchases.totalValue / purchases.totalShares : 0;
  };

  return {
    transactions: transactions || [],
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalShares,
    getAverageCostBasis
  };
};