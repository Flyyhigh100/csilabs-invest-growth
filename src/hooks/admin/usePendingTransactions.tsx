
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { useState } from 'react';

export interface PendingTransactionWithProfile extends Transaction {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export const usePendingTransactions = () => {
  const [includeTestData, setIncludeTestData] = useState(false);

  const fetchPendingTransactions = async (): Promise<PendingTransactionWithProfile[]> => {
    console.log('Fetching pending transactions with includeTestData:', includeTestData);
    
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'completed')
        .eq('token_sent', false)
        .order('created_at', { ascending: false });
        
      // Filter out test data if not included
      if (!includeTestData) {
        query = query.eq('is_test', false);
      }
        
      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching pending transactions:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} pending transactions`);
      
      // Ensure each transaction has a valid profiles property or null
      const validatedData = data?.map(tx => {
        // If profiles is an error or invalid format, set it to null
        if (tx.profiles && 'error' in tx.profiles) {
          return {
            ...tx,
            profiles: null
          };
        }
        return tx;
      }) as PendingTransactionWithProfile[];
      
      return validatedData;
    } catch (error) {
      console.error('Exception in fetchPendingTransactions:', error);
      throw error;
    }
  };
  
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['pending-transactions', includeTestData],
    queryFn: fetchPendingTransactions,
    refetchInterval: 10000,
  });
  
  return {
    data,
    isLoading,
    error,
    refetch,
    includeTestData,
    setIncludeTestData
  };
};
