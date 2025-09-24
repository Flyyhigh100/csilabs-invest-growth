import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface AdminLegacyAssetTransaction {
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

export type AdminTransactionType = 'purchase' | 'sale' | 'transfer_in' | 'transfer_out';

export const useAdminLegacyAssetTransactions = (targetUserId?: string, assetType?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch transactions for a specific user and asset type (admin only)
  const { 
    data: transactions, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['admin-legacy-asset-transactions', targetUserId, assetType],
    queryFn: async () => {
      if (!user || !targetUserId) return [];
      
      let query = supabase
        .from('user_legacy_asset_transactions')
        .select('*')
        .eq('user_id', targetUserId);

      if (assetType) {
        query = query.eq('asset_type', assetType);
      }

      const { data, error } = await query.order('transaction_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching admin legacy asset transactions:', error);
        throw error;
      }
      
      return data as AdminLegacyAssetTransaction[];
    },
    enabled: !!user && !!targetUserId,
  });

  // Add transaction for any user (admin only)
  const addTransaction = useMutation({
    mutationFn: async (transactionData: {
      userId: string;
      assetType: string;
      transactionType: AdminTransactionType;
      transactionDate: string;
      sharesQuantity: number;
      pricePerShare: number;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_legacy_asset_transactions')
        .insert({
          user_id: transactionData.userId,
          asset_type: transactionData.assetType,
          transaction_type: transactionData.transactionType,
          transaction_date: transactionData.transactionDate,
          shares_quantity: transactionData.sharesQuantity,
          price_per_share: transactionData.pricePerShare,
          notes: transactionData.notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin-legacy-asset-transactions', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['legacy-asset-transactions', variables.userId] 
      });
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error adding admin transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    }
  });

  // Update transaction for any user (admin only)
  const updateTransaction = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<AdminLegacyAssetTransaction> 
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Remove total_value from updates since it's a generated column
      const { total_value, ...finalUpdates } = updates;

      const { data, error } = await supabase
        .from('user_legacy_asset_transactions')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin-legacy-asset-transactions', data.user_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['legacy-asset-transactions', data.user_id] 
      });
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating admin transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    }
  });

  // Delete transaction for any user (admin only)
  const deleteTransaction = useMutation({
    mutationFn: async (transactionId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_legacy_asset_transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
    },
    onSuccess: (_, transactionId) => {
      const deletedTransaction = transactions?.find(t => t.id === transactionId);
      if (deletedTransaction) {
        queryClient.invalidateQueries({ 
          queryKey: ['admin-legacy-asset-transactions', deletedTransaction.user_id] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['legacy-asset-transactions', deletedTransaction.user_id] 
        });
      }
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting admin transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  });

  // Helper function to get total shares for asset type
  const getTotalShares = (assetType: string): number => {
    const assetTransactions = transactions?.filter(t => t.asset_type === assetType) || [];
    return assetTransactions.reduce((total, transaction) => {
      if (transaction.transaction_type === 'purchase' || transaction.transaction_type === 'transfer_in') {
        return total + transaction.shares_quantity;
      } else if (transaction.transaction_type === 'sale' || transaction.transaction_type === 'transfer_out') {
        return total - transaction.shares_quantity;
      }
      return total;
    }, 0);
  };

  // Helper function to get average cost basis
  const getAverageCostBasis = (assetType: string): number => {
    const purchaseTransactions = transactions?.filter(t => 
      t.asset_type === assetType && 
      (t.transaction_type === 'purchase' || t.transaction_type === 'transfer_in')
    ) || [];
    
    if (purchaseTransactions.length === 0) return 0;
    
    const totalCost = purchaseTransactions.reduce((sum, t) => sum + t.total_value, 0);
    const totalShares = purchaseTransactions.reduce((sum, t) => sum + t.shares_quantity, 0);
    
    return totalShares > 0 ? totalCost / totalShares : 0;
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