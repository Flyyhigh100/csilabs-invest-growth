
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { checkCryptoPaymentStatus } from './cryptoStatusService';

// Show appropriate status messages based on transaction status
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

// Get all pending crypto transactions
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

// Process a transaction update and show appropriate messages
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
