
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';
import { TransactionAnalyticsProps } from './types';

/**
 * Hook for fetching transaction data with filters
 */
export const useTransactionQuery = (props: TransactionAnalyticsProps = {}) => {
  const { includeTestData } = useTestDataToggle();
  const { startDate, endDate, status, paymentMethod, minAmount, maxAmount } = props;
  
  // Convert dates to ISO strings for querying
  const startDateIso = startDate ? startDate.toISOString() : null;
  const endDateIso = endDate ? endDate.toISOString() : null;
  
  return useQuery({
    queryKey: ['transaction-analytics', includeTestData, startDateIso, endDateIso, status, paymentMethod, minAmount, maxAmount],
    queryFn: async () => {
      console.log('Fetching transaction analytics with filters:', props);
      console.log('Include test data:', includeTestData);
      
      try {
        // Build query with filters
        let query = supabase.from('transactions').select('*');
        
        // Apply test data filter
        if (!includeTestData) {
          query = query.eq('is_test', false);
          console.log('Filtering out test data');
        }
        
        // Apply date filters
        if (startDateIso) {
          query = query.gte('created_at', startDateIso);
          console.log('Filtering by start date:', startDateIso);
        }
        
        if (endDateIso) {
          query = query.lte('created_at', endDateIso);
          console.log('Filtering by end date:', endDateIso);
        }
        
        // Apply status filter - only if explicitly set
        if (status) {
          query = query.eq('status', status);
          console.log('Filtering by status:', status);
        }
        
        // Apply payment method filter
        if (paymentMethod) {
          query = query.eq('payment_method', paymentMethod);
          console.log('Filtering by payment method:', paymentMethod);
        }
        
        // Apply amount filters
        if (minAmount !== undefined) {
          query = query.gte('amount', minAmount);
          console.log('Filtering by min amount:', minAmount);
        }
        
        if (maxAmount !== undefined) {
          query = query.lte('amount', maxAmount);
          console.log('Filtering by max amount:', maxAmount);
        }

        const { data: transactions, error } = await query;
        
        if (error) throw error;
        
        console.log(`Fetched ${transactions?.length || 0} transactions for analytics`);
        return transactions || [];
      } catch (error) {
        console.error('Error fetching transaction analytics:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
