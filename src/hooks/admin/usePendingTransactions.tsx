
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { useState } from 'react';

// Update the interface to include wallet address properties
export interface PendingTransactionWithProfile extends Transaction {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    wallet_address: string | null;
    solana_wallet_address: string | null;
    preferred_network: string | null;
  } | null;
}

export const usePendingTransactions = () => {
  const [includeTestData, setIncludeTestData] = useState(false);

  const fetchPendingTransactions = async (): Promise<PendingTransactionWithProfile[]> => {
    console.log('Fetching pending transactions with includeTestData:', includeTestData);
    
    try {
      // Use the standard Supabase query builder with proper typing
      let query = supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            wallet_address,
            solana_wallet_address,
            preferred_network
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
      
      console.log(`Fetched ${data?.length || 0} pending transactions with enhanced profile data`);
      
      // Process the data to ensure consistent structure
      const validatedData = data?.map(tx => {
        // Handle case where profiles might be null or invalid
        if (!tx.profiles) {
          return {
            ...tx,
            profiles: null
          };
        }
        
        // Handle array result (sometimes Supabase returns array)
        const profileData = Array.isArray(tx.profiles) ? tx.profiles[0] : tx.profiles;
        
        // Ensure we have a properly formatted profiles object
        return {
          ...tx,
          profiles: {
            first_name: profileData?.first_name || null,
            last_name: profileData?.last_name || null,
            email: profileData?.email || null,
            wallet_address: profileData?.wallet_address || null,
            solana_wallet_address: profileData?.solana_wallet_address || null,
            preferred_network: profileData?.preferred_network || null
          }
        };
      }) as PendingTransactionWithProfile[];
      
      return validatedData || [];
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      
      // Fallback: fetch just transactions without profiles if the join fails
      console.log('Trying fallback - fetching just transactions without profiles');
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'completed')
        .eq('token_sent', false)
        .order('created_at', { ascending: false });
      
      // Return transactions with null profiles
      return (data || []).map(tx => ({
        ...tx,
        profiles: null
      })) as PendingTransactionWithProfile[];
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
    refetchInterval: 10000, // Keep the 10-second refetch interval
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
