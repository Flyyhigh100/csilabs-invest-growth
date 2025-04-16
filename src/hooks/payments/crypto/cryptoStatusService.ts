
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { checkCryptoPaymentStatus } from './statusCheckService';
import { mapTransactionStatus, handleTransactionUpdate } from './notificationService';
import { CryptoStatusCheckResult } from './types';

// Re-export all the functions from the service modules
export { 
  checkCryptoPaymentStatus,
  mapTransactionStatus,
  handleTransactionUpdate
};

/**
 * Main service that consolidates crypto status check functionality
 */
export async function checkTransactionStatus(
  transaction: Transaction,
  forceUpdate: boolean = false
): Promise<Transaction | null> {
  if (!transaction || !transaction.id) {
    console.error('Invalid transaction provided to checkTransactionStatus');
    return null;
  }
  
  try {
    console.log(`Starting status check for transaction ${transaction.id} (${transaction.status})`);
    const result = await checkCryptoPaymentStatus(transaction.id, forceUpdate);
    console.log('Status check result:', result);
    
    if (result.error) {
      console.error(`Error checking status: ${result.error}`);
      return null;
    }
    
    return mapTransactionStatus(transaction, result);
  } catch (error) {
    console.error(`Error in checkTransactionStatus for transaction ${transaction.id}:`, error);
    return null;
  }
}

/**
 * Force update transaction status with the payment provider
 */
export async function forceUpdateTransaction(transaction: Transaction): Promise<Transaction | null> {
  if (!transaction || !transaction.id) {
    console.error('Invalid transaction provided to forceUpdateTransaction');
    return null;
  }
  
  try {
    console.log(`Forcing update for transaction ${transaction.id} (${transaction.status})`);
    return await checkTransactionStatus(transaction, true);
  } catch (error) {
    console.error(`Error in forceUpdateTransaction for transaction ${transaction.id}:`, error);
    return null;
  }
}
