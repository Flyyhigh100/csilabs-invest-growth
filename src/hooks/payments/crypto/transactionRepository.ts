
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

/**
 * Get all pending crypto transactions
 */
export async function getPendingTransactions(): Promise<Transaction[] | null> {
  try {
    console.log('Fetching pending crypto transactions...');
    const { data: pendingTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('payment_method', 'coinpayments')
      .in('status', ['pending', 'confirmed']);
    
    if (fetchError) {
      console.error('Error fetching pending transactions:', fetchError);
      throw fetchError;
    }
    
    console.log(`Found ${pendingTransactions?.length || 0} pending transactions`);
    return pendingTransactions;
  } catch (error) {
    console.error('Error in getPendingTransactions:', error);
    throw error;
  }
}
