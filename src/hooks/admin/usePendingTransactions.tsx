
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { useState } from 'react';

// Update the interface to properly handle profile errors
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
      
      // Properly handle errors in the profiles join by explicitly casting
      // and validating the data before returning it
      const validatedData = data?.map(tx => {
        // Check if profiles is an error object (like when join fails)
        if (tx.profiles && typeof tx.profiles === 'object' && 'error' in tx.profiles) {
          return {
            ...tx,
            profiles: null
          };
        }
        
        // Ensure profiles has the expected structure, or set to null if invalid
        if (tx.profiles && typeof tx.profiles === 'object') {
          // Ensure profiles is valid or null
          return {
            ...tx,
            profiles: {
              first_name: tx.profiles.first_name || null,
              last_name: tx.profiles.last_name || null,
              email: tx.profiles.email || null
            }
          };
        }
        
        // If profiles is not as expected, set it to null
        return { ...tx, profiles: null };
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
