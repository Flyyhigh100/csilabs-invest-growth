
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

/**
 * Check status of a payment by transaction ID in Supabase
 */
export async function checkPaymentStatus(transactionId: string, checkTransactionStatus: Function): Promise<boolean> {
  try {
    // Get the transaction from Supabase
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();
      
    if (error || !transaction) {
      console.error("Error fetching transaction:", error);
      return false;
    }
    
    // Use the provided checkTransactionStatus function
    const updatedTransaction = await checkTransactionStatus(transaction);
    return !!updatedTransaction;
  } catch (err) {
    console.error("Error checking payment status:", err);
    return false;
  }
}
