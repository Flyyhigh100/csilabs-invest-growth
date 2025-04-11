import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { CryptoStatusCheckResult } from './types';

export async function checkCryptoPaymentStatus(
  transactionId: string,
  forceUpdate: boolean = false
): Promise<CryptoStatusCheckResult> {
  console.log(`Checking status for CoinPayments transaction: ${transactionId}`);
  
  const { data: result, error } = await supabase.functions.invoke('check-coinpayments-status', {
    body: {
      transactionId,
      forceUpdate
    }
  }) as { data: CryptoStatusCheckResult, error: any };
  
  if (error) {
    console.error('Error checking crypto payment status:', error);
    throw new Error(error.message || 'Please try again later');
  }
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  console.log('Status check result:', result);
  return result;
}

export function mapTransactionStatus(
  transaction: Transaction, 
  result: CryptoStatusCheckResult
): Transaction {
  // If the transaction was updated, return with new status
  if (result.updated) {
    return {
      ...transaction,
      status: result.status
    };
  } 
  
  // Otherwise return the original transaction
  return transaction;
}
