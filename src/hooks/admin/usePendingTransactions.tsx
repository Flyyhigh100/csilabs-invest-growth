
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { useState } from 'react';

// Update the interface to better handle null/error cases with profiles
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
      // Use explicit join instead of implicit join
      let query = supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id(
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
      
      // Process the data to ensure consistent structure regardless of join success
      const validatedData = data?.map(tx => {
        // Case 1: profiles is null
        if (!tx.profiles) {
          return {
            ...tx,
            profiles: null
          };
        }
        
        // Case 2: profiles array is empty (join returned no results)
        if (Array.isArray(tx.profiles) && tx.profiles.length === 0) {
          return {
            ...tx,
            profiles: null
          };
        }
        
        // Case 3: profiles is an error object
        if (typeof tx.profiles === 'object' && tx.profiles && 'error' in tx.profiles) {
          return {
            ...tx,
            profiles: null
          };
        }
        
        // Case 4: profiles exists but may be in various formats due to the join
        const profileData = Array.isArray(tx.profiles) ? tx.profiles[0] : tx.profiles;
        
        if (profileData && typeof profileData === 'object') {
          return {
            ...tx,
            profiles: {
              first_name: typeof profileData.first_name === 'string' ? profileData.first_name : null,
              last_name: typeof profileData.last_name === 'string' ? profileData.last_name : null,
              email: typeof profileData.email === 'string' ? profileData.email : null
            }
          };
        }
        
        // Default case: profiles data is invalid or unexpected format
        return { ...tx, profiles: null };
      }) as PendingTransactionWithProfile[];
      
      return validatedData || [];
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
