
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UseUserTransactionsProps } from './types';

export const useTransactionQuery = (props: UseUserTransactionsProps = {}) => {
  const { userId, status, startDate, endDate, minAmount, maxAmount, paymentMethod, limit = 100, sortBy = 'created_at', sortOrder = 'desc' } = props;
  
  return useQuery({
    queryKey: ['admin-transactions', userId, status, startDate, endDate, minAmount, maxAmount, paymentMethod, limit, sortBy, sortOrder],
    queryFn: async () => {
      console.log(`Fetching transactions for ${userId ? 'user: ' + userId : 'all users'}`);
      
      // Start building the query
      let query = supabase
        .from('transactions')
        .select('*');
      
      // Apply filters
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      
      if (minAmount !== undefined) {
        query = query.gte('amount', minAmount);
      }
      
      if (maxAmount !== undefined) {
        query = query.lte('amount', maxAmount);
      }
      
      if (paymentMethod) {
        query = query.eq('payment_method', paymentMethod);
      }
      
      // Apply sorting and limits
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .limit(limit);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} transactions`);
      return data || [];
    }
  });
};
