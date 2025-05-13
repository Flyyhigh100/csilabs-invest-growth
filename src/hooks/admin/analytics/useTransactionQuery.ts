
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TransactionAnalyticsProps } from './types';
import { useTestDataToggle } from '../useTestDataToggle';

/**
 * Hook to fetch transaction data for analytics
 */
export const useTransactionQuery = (props: TransactionAnalyticsProps = {}) => {
  const { startDate, endDate, status, paymentMethod, minAmount, maxAmount } = props;
  const { includeTestData } = useTestDataToggle();
  
  return useQuery({
    queryKey: ['transactionAnalytics', { startDate, endDate, status, paymentMethod, minAmount, maxAmount, includeTestData }],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*');
      
      // Apply date filters
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      
      // Apply status filter
      if (status) {
        query = query.eq('status', status);
      }
      
      // Apply payment method filter
      if (paymentMethod) {
        query = query.eq('payment_method', paymentMethod);
      }
      
      // Apply amount filters
      if (minAmount !== undefined) {
        query = query.gte('amount', minAmount);
      }
      
      if (maxAmount !== undefined) {
        query = query.lte('amount', maxAmount);
      }
      
      // Handle test data inclusion
      if (!includeTestData) {
        query = query.is('is_test', false);
      }
      
      // Execute the query
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transaction analytics data:', error);
        throw error;
      }
      
      return data || [];
    },
  });
};
