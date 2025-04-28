
import { toast } from 'sonner';
import { showSmartNotification } from '@/utils/notification/smartNotifications';
import { Transaction } from '@/types/transactions';

export function showStatusMessage(status: string, externalStatusText?: string): void {
  console.log(`Showing status message for: ${status}, external text: ${externalStatusText || 'none'}`);
  
  if (status === 'completed') {
    showSmartNotification(
      'Payment completed!',
      'Your crypto payment has been confirmed. Your tokens will be sent to your wallet shortly.',
      { type: 'payment', priority: 'high' }
    );
  } else if (status === 'confirmed') {
    showSmartNotification(
      'Payment received!',
      'Your payment has been received and is being processed. Your tokens will be sent to your wallet soon.',
      { type: 'payment', priority: 'high' }
    );
  } else if (status === 'failed') {
    showSmartNotification(
      'Payment failed',
      'Your crypto payment transaction has failed or was canceled.',
      { type: 'payment', priority: 'high' }
    );
  } else if (status === 'pending' && externalStatusText) {
    showSmartNotification(
      'Payment status update',
      `Status: ${externalStatusText}`,
      { type: 'status', priority: 'low', duration: 3000 }
    );
  } else if (status === 'pending') {
    showSmartNotification(
      'Payment pending',
      'Your payment is still being processed. Please check back later.',
      { type: 'status', priority: 'low', duration: 3000 }
    );
  }
}

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
    // Only show pending messages occasionally to avoid spam
    if (Math.random() < 0.3) { // Show roughly 30% of pending updates
      showStatusMessage('pending', externalStatusText);
    }
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
