
import { useState } from 'react';
import { toast } from 'sonner';
import { Transaction } from '@/types/transactions';
import { checkCryptoPaymentStatus, mapTransactionStatus } from './cryptoStatusService';
import { getPendingTransactions, handleTransactionUpdate } from './transactionUtils';

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

    // We'll allow checking even completed transactions when explicitly requested
    // This is useful for fixing stuck transactions
    if (transaction.status === 'completed' && transaction.token_sent) {
      console.log('Transaction is already completed and tokens sent');
      return transaction;
    }

    try {
      setIsChecking(true);
      
      toast.info("Checking payment status...", {
        id: "check-crypto-status",
      });
      
      // Get status from API
      const result = await checkCryptoPaymentStatus(transaction.id);
      
      toast.dismiss('check-crypto-status');
      
      // Update and return transaction with new status info
      const updatedTransaction = mapTransactionStatus(transaction, result);
      
      // Show appropriate message based on status
      handleTransactionUpdate(
        transaction, 
        result.status,
        result.external_status_text, 
        result.updated
      );
      
      return updatedTransaction;
    } catch (err) {
      console.error('Exception in checkTransactionStatus:', err);
      toast.dismiss('check-crypto-status');
      toast.error('Error checking payment status');
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  // Function to manually trigger a refresh for all pending transactions
  const refreshAllPendingTransactions = async (): Promise<boolean> => {
    try {
      setIsChecking(true);
      
      toast.info('Refreshing all pending transactions...', {
        id: 'refresh-all-crypto',
      });
      
      // Get all pending coinpayments transactions for the current user
      const pendingTransactions = await getPendingTransactions();
      
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

  // Force-sync a specific transaction - This is critical for fixing stuck transactions
  const forceUpdateTransaction = async (transaction: Transaction): Promise<Transaction | null> => {
    if (!transaction || !transaction.id) {
      toast.error('Invalid transaction');
      return null;
    }

    // Ensure this is only used for CoinPayments transactions
    if (transaction.payment_method !== 'coinpayments') {
      toast.error('This is not a CoinPayments transaction');
      return null;
    }

    try {
      setIsChecking(true);
      
      toast.info("Force updating payment status...", {
        id: "force-update-crypto",
      });
      
      // Call API with force update flag
      const result = await checkCryptoPaymentStatus(transaction.id, true);
      
      toast.dismiss('force-update-crypto');
      
      // Update transaction with new status
      const updatedTransaction = mapTransactionStatus(transaction, result);
      
      // Show appropriate result message
      if (result.updated) {
        toast.success('Payment status updated', {
          description: `Status changed to: ${result.status}`
        });
      } else {
        toast.info('No status change needed', {
          description: `Current status: ${result.external_status_text || result.status}`
        });
      }
      
      return updatedTransaction;
    } catch (err) {
      console.error('Exception in forceUpdateTransaction:', err);
      toast.dismiss('force-update-crypto');
      toast.error('Error updating payment status');
      return null;
    } finally {
      setIsChecking(false);
    }
  };
  
  return {
    checkTransactionStatus,
    refreshAllPendingTransactions,
    forceUpdateTransaction,
    isChecking
  };
};
