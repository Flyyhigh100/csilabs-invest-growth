
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { toast } from 'sonner';

interface UseTransactionManagerProps {
  status?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
  includeTestData?: boolean;
  olderThanDays?: number;
}

export const useTransactionManager = (props: UseTransactionManagerProps = {}) => {
  const [error, setError] = useState<Error | null>(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  
  const fetchTransactions = async () => {
    try {
      const { 
        status, 
        paymentMethod, 
        startDate, 
        endDate, 
        searchQuery, 
        includeTestData = false,
      } = props;
      
      console.log('Fetching transactions with filters:', { status, paymentMethod, startDate, endDate, searchQuery, includeTestData });
      
      // Start building the query
      let query = supabase
        .from('transactions')
        .select('*');
      
      // Apply filters only if they have actual values (not undefined/null)
      if (status && status.trim() !== '') {
        query = query.eq('status', status);
      }
      
      if (paymentMethod && paymentMethod.trim() !== '') {
        query = query.eq('payment_method', paymentMethod);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('created_at', nextDay.toISOString());
      }
      
      // Handle search query for multiple fields
      if (searchQuery && searchQuery.trim() !== '') {
        query = query.or(
          `transaction_id.ilike.%${searchQuery}%,external_transaction_id.ilike.%${searchQuery}%,wallet_address.ilike.%${searchQuery}%`
        );
      }
      
      // Handle test data inclusion
      if (!includeTestData) {
        query = query.eq('is_test', false);
      }
      
      // Apply sorting and limits
      query = query
        .order('created_at', { ascending: false })
        .limit(500); // Increased limit to show more transactions
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log(`Fetched ${data?.length || 0} transactions`);
      return data || [];
    } catch (err) {
      console.error('Exception in fetchTransactions:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  };

  // Use React Query for data fetching
  const { 
    data: transactions, 
    isLoading, 
    refetch,
  } = useQuery({
    queryKey: [
      'admin-transactions-manager', 
      props.status, 
      props.paymentMethod, 
      props.startDate?.toISOString(), 
      props.endDate?.toISOString(),
      props.searchQuery,
      props.includeTestData,
    ],
    queryFn: fetchTransactions,
  });

  // Check and update old pending transactions
  const cleanupOldPendingTransactions = async () => {
    try {
      setIsCleaningUp(true);
      
      const { olderThanDays = 7 } = props;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      toast.info(
        `Checking old pending transactions`, 
        { description: `Looking for pending transactions older than ${olderThanDays} days` }
      );
      
      // Get pending CoinPayments transactions older than specified days
      const { data: oldTransactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_method', 'coinpayments')
        .eq('status', 'pending')
        .lt('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw new Error(`Failed to fetch old transactions: ${fetchError.message}`);
      }
      
      if (!oldTransactions || oldTransactions.length === 0) {
        toast.info('No old pending transactions found');
        return;
      }
      
      toast.info(`Found ${oldTransactions.length} old pending transactions to check`);
      
      // Call edge function to check and update these transactions
      const { data, error } = await supabase.functions.invoke('admin-sync-all-transactions', {
        body: { 
          transactionIds: oldTransactions.map(tx => tx.id),
          forceUpdate: true,
          storeExternalIds: true
        }
      });
      
      if (error) {
        throw new Error(`Failed to sync transactions: ${error.message}`);
      }
      
      // Process results
      if (data.successCount === 0 && data.failureCount === 0) {
        toast.info('No transactions needed updating');
      } else if (data.failureCount === 0) {
        toast.success(`Successfully updated ${data.successCount} transactions`);
      } else {
        toast.warning(
          `Processed with some issues`,
          { description: `${data.successCount} succeeded, ${data.failureCount} failed` }
        );
      }
      
      // Refresh the transactions list
      refetch();
      
    } catch (err) {
      console.error('Error cleaning up old transactions:', err);
      toast.error(
        'Failed to clean up old transactions',
        { description: err instanceof Error ? err.message : 'Unknown error' }
      );
    } finally {
      setIsCleaningUp(false);
    }
  };
  
  // Update a transaction status manually
  const updateTransactionStatus = async (transactionId: string, newStatus: string): Promise<boolean> => {
    try {
      console.log(`Updating transaction ${transactionId} status to ${newStatus}`);
      
      // If the special "force_check" status is used, call the edge function to check status
      if (newStatus === 'force_check') {
        const { error } = await supabase.functions.invoke('check-coinpayments-status', {
          body: {
            transactionId,
            forceUpdate: true
          }
        });
        
        if (error) {
          throw new Error(`Failed to check transaction status: ${error.message}`);
        }
        
        // Refresh transactions after update
        refetch();
        return true;
      }
      
      // For all other status types, update directly
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          admin_notes: `Status manually updated to ${newStatus} by admin` 
        })
        .eq('id', transactionId);
      
      if (error) {
        throw new Error(`Failed to update transaction: ${error.message}`);
      }
      
      // Refresh transactions after update
      refetch();
      return true;
      
    } catch (err) {
      console.error('Error updating transaction status:', err);
      throw err;
    }
  };

  // Reset error when filters change
  useEffect(() => {
    setError(null);
  }, [props.status, props.paymentMethod, props.startDate, props.endDate, props.searchQuery, props.includeTestData]);

  return {
    transactions,
    isLoading,
    error,
    refetch,
    cleanupOldPendingTransactions,
    isCleaningUp,
    updateTransactionStatus,
  };
};
