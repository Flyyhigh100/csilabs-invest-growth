
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

/**
 * Hook to provide transaction API functionality
 */
export const useTransactionApi = () => {
  // Function to verify a transaction by ID
  const verifyTransaction = useCallback(async (id: string) => {
    try {
      console.log(`Checking transaction with ID: ${id}`);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching transaction:", error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error("Error in transaction verification:", err);
      return null;
    }
  }, []);

  return { verifyTransaction };
};
