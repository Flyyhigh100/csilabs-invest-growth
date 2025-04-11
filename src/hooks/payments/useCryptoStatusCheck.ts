
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

interface CryptoStatusCheckResult {
  status: string;
  updated: boolean;
  external_status?: number;
  external_status_text?: string;
  message?: string;
  error?: string;
}

export const useCryptoStatusCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkTransactionStatus = async (transaction: Transaction): Promise<Transaction | null> => {
    if (!transaction || !transaction.id) {
      toast.error('Invalid transaction');
      return null;
    }
    
    if (transaction.payment_method !== 'coinpayments') {
      console.log('This is not a CoinPayments transaction');
      return null;
    }

    if (transaction.status === 'completed') {
      console.log('Transaction is already completed');
      return transaction;
    }

    try {
      setIsChecking(true);
      
      toast.info('Checking payment status...', {
        id: 'check-crypto-status',
      });
      
      console.log(`Checking status for CoinPayments transaction: ${transaction.id}`);
      const { data: result, error } = await supabase.functions.invoke('check-coinpayments-status', {
        body: {
          transactionId: transaction.id
        }
      }) as { data: CryptoStatusCheckResult, error: any };
      
      if (error) {
        toast.dismiss('check-crypto-status');
        console.error('Error checking crypto payment status:', error);
        toast.error('Failed to check payment status', {
          description: error.message || 'Please try again later'
        });
        return null;
      }
      
      toast.dismiss('check-crypto-status');
      
      if (result.error) {
        toast.error('Failed to check payment status', {
          description: result.error
        });
        return null;
      }
      
      console.log('Status check result:', result);
      
      // If the transaction was updated, show appropriate message
      if (result.updated) {
        if (result.status === 'completed') {
          toast.success('Payment confirmed!', {
            description: 'Your crypto payment has been confirmed. Your tokens will be sent to your wallet shortly.'
          });
        } else if (result.status === 'failed') {
          toast.error('Payment failed', {
            description: 'Your crypto payment transaction has failed or was canceled.'
          });
        }
        
        // Return updated transaction data
        return {
          ...transaction,
          status: result.status
        };
      } else {
        if (transaction.status === 'pending') {
          // Check the external status to provide more accurate messages
          if (result.external_status_text) {
            toast.info(`Payment status: ${result.external_status_text}`, {
              description: 'Status from payment provider. The system will update automatically when completed.'
            });
          } else {
            toast.info('Payment still pending', {
              description: 'Your payment is still being processed. Please check back later.'
            });
          }
        }
        return transaction;
      }
    } catch (err) {
      console.error('Exception in checkTransactionStatus:', err);
      toast.error('Error checking payment status');
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  // New function to manually trigger a refresh for all pending transactions
  const refreshAllPendingTransactions = async (): Promise<boolean> => {
    try {
      setIsChecking(true);
      
      toast.info('Refreshing all pending transactions...', {
        id: 'refresh-all-crypto',
      });
      
      // Get all pending coinpayments transactions for the current user
      const { data: pendingTransactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_method', 'coinpayments')
        .eq('status', 'pending');
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (!pendingTransactions || pendingTransactions.length === 0) {
        toast.dismiss('refresh-all-crypto');
        toast.info('No pending crypto transactions found');
        return true;
      }
      
      console.log(`Found ${pendingTransactions.length} pending transactions to refresh`);
      
      // Process each transaction
      let updatedCount = 0;
      for (const tx of pendingTransactions) {
        const updated = await checkTransactionStatus(tx);
        if (updated && updated.status !== tx.status) {
          updatedCount++;
        }
      }
      
      toast.dismiss('refresh-all-crypto');
      
      if (updatedCount > 0) {
        toast.success(`Updated ${updatedCount} transaction(s)`, {
          description: 'Transaction statuses have been synchronized with the payment provider.'
        });
      } else {
        toast.info('No changes needed', {
          description: 'All transaction statuses are up-to-date.'
        });
      }
      
      return true;
    } catch (err) {
      console.error('Error refreshing transactions:', err);
      toast.error('Failed to refresh transactions');
      return false;
    } finally {
      setIsChecking(false);
    }
  };
  
  return {
    checkTransactionStatus,
    refreshAllPendingTransactions,
    isChecking
  };
};
