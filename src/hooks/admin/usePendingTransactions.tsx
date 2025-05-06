
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
      // Build the SQL query for the admin function
      const sql = `
        SELECT 
          t.*,
          json_build_object(
            'first_name', p.first_name,
            'last_name', p.last_name,
            'email', p.email
          ) as profiles
        FROM 
          transactions t
        LEFT JOIN 
          profiles p ON t.user_id = p.id
        WHERE 
          t.status = 'completed' 
          AND t.token_sent = false
          ${includeTestData ? '' : 'AND t.is_test = false'}
        ORDER BY 
          t.created_at DESC
      `;
      
      // Use the standard Supabase query builder with proper typing instead of the RPC function
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'completed')
        .eq('token_sent', false)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching pending transactions:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} pending transactions using direct join query`);
      
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
            email: profileData?.email || null
          }
        };
      }) as PendingTransactionWithProfile[];
      
      if (!includeTestData) {
        return (validatedData || []).filter(tx => !tx.is_test);
      }
      
      return validatedData || [];
    } catch (error) {
      // If the first approach failed, try the fallback method
      console.error('Error with direct query approach, trying fallback method:', error);
      return fetchPendingTransactionsFallback();
    }
  };
  
  // Fallback method using direct query builder approach
  const fetchPendingTransactionsFallback = async (): Promise<PendingTransactionWithProfile[]> => {
    try {
      console.log('Using fallback method to fetch pending transactions');
      
      // Build the query
      let query = supabase.from('transactions')
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
        console.error('Error in fallback method:', error);
        throw error;
      }
      
      console.log(`Fallback method fetched ${data?.length || 0} transactions`);
      
      // Process the data to ensure consistent structure
      const validatedData = data?.map(tx => {
        // Case 1: profiles is null or undefined
        if (!tx.profiles) {
          return {
            ...tx,
            profiles: null
          };
        }
        
        // Case 2: Handle array result (sometimes Supabase returns array)
        const profileData = Array.isArray(tx.profiles) ? tx.profiles[0] : tx.profiles;
        
        // Case 3: Handle valid profile data
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
        
        // Default case: invalid data format
        return { ...tx, profiles: null };
      }) as PendingTransactionWithProfile[];
      
      return validatedData || [];
    } catch (error) {
      console.error('Fatal error in fallback method:', error);
      
      // As a last resort, fetch just transactions without profiles
      console.log('Trying last resort - fetching just transactions without profiles');
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
    refetchInterval: 10000, // Keep the 10-second refetch interval, but we'll control toast frequency
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
