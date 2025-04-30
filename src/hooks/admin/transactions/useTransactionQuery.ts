
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { UseUserTransactionsProps } from './types';

// Hook to fetch transaction data with filters
export const useTransactionQuery = ({
  userId,
  dateRange,
  status,
  paymentMethod,
  minAmount,
  maxAmount,
  searchQuery
}: UseUserTransactionsProps = {}) => {
  return useQuery({
    queryKey: ['user-transactions', userId, dateRange, status, paymentMethod, minAmount, maxAmount, searchQuery],
    queryFn: async () => {
      try {
        if (!userId) return [];

        console.log(`Fetching transactions for user ${userId} with filters:`, {
          dateRange,
          status,
          paymentMethod,
          minAmount,
          maxAmount,
          searchQuery
        });

        // Start with the base query
        let query = supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply filters
        if (userId) {
          query = query.eq('user_id', userId);
        }

        if (dateRange?.from) {
          query = query.gte('created_at', dateRange.from.toISOString());
        }

        if (dateRange?.to) {
          query = query.lte('created_at', dateRange.to.toISOString());
        }

        if (status) {
          query = query.eq('status', status);
        }

        if (paymentMethod) {
          query = query.eq('payment_method', paymentMethod);
        }

        if (minAmount !== undefined) {
          query = query.gte('amount', minAmount);
        }

        if (maxAmount !== undefined) {
          query = query.lte('amount', maxAmount);
        }

        // Execute the query
        const { data, error } = await query;

        if (error) throw error;

        // Apply search filtering in memory (since we can't easily do this in the database query)
        let filteredData = data;
        if (searchQuery) {
          const lowerSearchQuery = searchQuery.toLowerCase();
          filteredData = data.filter(tx => 
            tx.transaction_id?.toLowerCase().includes(lowerSearchQuery) ||
            tx.payment_method?.toLowerCase().includes(lowerSearchQuery) ||
            tx.wallet_address?.toLowerCase().includes(lowerSearchQuery) ||
            tx.admin_notes?.toLowerCase().includes(lowerSearchQuery)
          );
        }

        console.log(`Found ${filteredData.length} transactions for user ${userId}`);
        return filteredData as Transaction[];
      } catch (err) {
        console.error("Error fetching user transactions:", err);
        throw err;
      }
    },
    enabled: !!userId,
  });
};
