import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UseUserTransactionsProps } from './types';

export const useTransactionQuery = (props: UseUserTransactionsProps = {}) => {
  const { 
    userId, 
    status, 
    startDate, 
    endDate, 
    minAmount, 
    maxAmount, 
    paymentMethod, 
    limit = 100, 
    sortBy = 'created_at', 
    sortOrder = 'desc',
    includeTest = false
  } = props;
  
  // Define status groups for easier filtering
  const statusGroups = {
    pending: ['pending', 'processing'],
    completed: ['completed'],
    cancelled: ['cancelled', 'expired'],
    failed: ['failed', 'error']
  };
  
  return useQuery({
    queryKey: ['admin-transactions', userId, status, startDate, endDate, minAmount, maxAmount, paymentMethod, limit, sortBy, sortOrder, includeTest],
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
      
      // Handle status filters including status groups
      if (status) {
        if (Object.keys(statusGroups).includes(status)) {
          // If it's a status group (pending, completed, cancelled, failed), use in() filter
          query = query.in('status', statusGroups[status as keyof typeof statusGroups]);
        } else {
          // Otherwise filter by exact status
          query = query.eq('status', status);
        }
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
      
      // Filter out test transactions unless explicitly included
      if (!includeTest) {
        query = query.eq('is_test', false);
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
