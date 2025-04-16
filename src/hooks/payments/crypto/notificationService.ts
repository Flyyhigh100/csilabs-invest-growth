import { Transaction } from '@/types/transactions';
import { toast } from 'sonner';

/**
 * Show appropriate status messages based on transaction status
 */
export function showStatusMessage(status: string, externalStatusText?: string): void {
  console.log(`Showing status message for: ${status}, external text: ${externalStatusText || 'none'}`);
  
  if (status === 'completed') {
    toast.success('Payment completed!', {
      description: 'Your crypto payment has been confirmed. Your tokens will be sent to your wallet shortly.'
    });
  } else if (status === 'confirmed') {
    toast.success('Payment received!', {
      description: 'Your payment has been received and is being processed. Your tokens will be sent to your wallet soon.'
    });
  } else if (status === 'failed') {
    toast.error('Payment failed', {
      description: 'Your crypto payment transaction has failed or was canceled.'
    });
  } else if (status === 'pending' && externalStatusText) {
    toast.info(`Payment status: ${externalStatusText}`, {
      description: 'Status from payment provider. The system will update automatically when completed.'
    });
  } else if (status === 'pending') {
    toast.info('Payment still pending', {
      description: 'Your payment is still being processed. Please check back later.'
    });
  }
}

/**
 * Update transaction status and show appropriate notifications
 */
export function handleTransactionUpdate(
  transaction: Transaction, 
  updatedStatus: string, 
  externalStatusText?: string, 
  wasUpdated: boolean = true
): void {
  console.log(`handleTransactionUpdate: ${transaction.status} -> ${updatedStatus}, wasUpdated: ${wasUpdated}`);
  
  if (wasUpdated && transaction.status !== updatedStatus) {
    showStatusMessage(updatedStatus, externalStatusText);
  } else if (transaction.status === 'pending') {
    showStatusMessage('pending', externalStatusText);
  } else if (transaction.status === 'confirmed' && externalStatusText) {
    showStatusMessage('confirmed', externalStatusText);
  }
}

/**
 * Update transaction in UI and show appropriate status message
 */
export function mapTransactionStatus(
  transaction: Transaction, 
  result: any
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
