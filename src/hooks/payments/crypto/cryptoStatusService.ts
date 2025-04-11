
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { CryptoStatusCheckResult } from './types';
import { toast } from 'sonner';

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
    console.error('Error in status check result:', result.error);
    throw new Error(result.error);
  }
  
  console.log('Status check result:', result);
  return result;
}

export function mapTransactionStatus(
  transaction: Transaction, 
  result: CryptoStatusCheckResult
): Transaction {
  // If the transaction was updated or force updated, return with new status
  if (result.updated) {
    if (transaction.status !== result.status) {
      console.log(`Transaction status updated: ${transaction.status} -> ${result.status}`);
      
      // Show toast notification for important status changes
      if (result.status === 'confirmed') {
        toast.success('Payment confirmed!', {
          description: 'Your payment was received and is being processed.'
        });
      } else if (result.status === 'completed') {
        toast.success('Payment completed!', {
          description: 'Your payment has been completed. Your tokens will be sent soon.'
        });
      }
    }
    
    return {
      ...transaction,
      status: result.status
    };
  } 
  
  // Otherwise return the original transaction
  return transaction;
}
