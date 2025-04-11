
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { CryptoStatusCheckResult } from './types';
import { toast } from 'sonner';

export async function checkCryptoPaymentStatus(
  transactionId: string,
  forceUpdate: boolean = false
): Promise<CryptoStatusCheckResult> {
  console.log(`Checking status for CoinPayments transaction: ${transactionId}, forceUpdate: ${forceUpdate}`);
  
  try {
    // Attempt to invoke the edge function
    const { data: result, error } = await supabase.functions.invoke('check-coinpayments-status', {
      body: {
        transactionId,
        forceUpdate
      }
    }) as { data: CryptoStatusCheckResult, error: any };
    
    if (error) {
      console.error('Error from edge function:', error);
      
      // Check if this is a 404 error (function not found)
      if (error.message && error.message.includes('404')) {
        return {
          error: 'The check-coinpayments-status function is not deployed or not accessible.',
          status: 'error',
          updated: false
        };
      }
      
      return {
        error: error.message || 'Edge function error. Please try again later',
        status: 'error',
        updated: false
      };
    }
    
    if (!result) {
      console.error('Empty result from edge function');
      return {
        error: 'No response from status check function',
        status: 'error',
        updated: false
      };
    }
    
    if (result.error) {
      console.error('Error in status check result:', result.error);
      return {
        ...result,
        status: result.status || 'error',
        updated: false
      };
    }
    
    console.log('Status check result:', result);
    
    // Log external status information if available
    if (result.external_status !== undefined) {
      console.log(`External status code: ${result.external_status}, text: ${result.external_status_text}`);
    }
    
    return result;
  } catch (error: any) {
    console.error('Exception in checkCryptoPaymentStatus:', error);
    return {
      error: error.message || 'Error checking payment status',
      status: 'error',
      updated: false
    };
  }
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
    } else {
      console.log(`Transaction status unchanged (${result.status}) but marked as updated`);
    }
    
    return {
      ...transaction,
      status: result.status
    };
  } 
  
  // Otherwise return the original transaction
  console.log(`No status change needed for transaction ${transaction.id} (${transaction.status})`);
  return transaction;
}
