
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { useState } from 'react';

// Define type for Supabase SelectQueryError
type SelectQueryError = {
  error: true;
  message?: string;
};

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
      
      // Properly handle all possible cases for the profiles join
      const validatedData = data?.map(tx => {
        // Case 1: profiles is null
        if (tx.profiles === null) {
          return {
            ...tx,
            profiles: null
          };
        }
        
        // Case 2: profiles is an error object - first convert to unknown, then check
        // This addresses the TS2352 error
        const profileData = tx.profiles as unknown;
        
        // Check if it's an error object by checking for presence of 'error' property
        if (profileData !== null && 
            typeof profileData === 'object' && 
            profileData && 
            'error' in profileData) {
          return {
            ...tx,
            profiles: null
          };
        }
        
        // Case 3: profiles exists but may not have all required properties
        // At this point we can safely cast to Record<string, unknown>
        if (profileData !== null && typeof profileData === 'object') {
          const safeProfileData = profileData as Record<string, unknown>;
          return {
            ...tx,
            profiles: {
              first_name: typeof safeProfileData.first_name === 'string' ? safeProfileData.first_name : null,
              last_name: typeof safeProfileData.last_name === 'string' ? safeProfileData.last_name : null,
              email: typeof safeProfileData.email === 'string' ? safeProfileData.email : null
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
