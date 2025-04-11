
import { useState } from 'react';
import { toast } from 'sonner';
import { Transaction } from '@/types/transactions';
import { checkCryptoPaymentStatus, mapTransactionStatus } from './cryptoStatusService';
import { getPendingTransactions, handleTransactionUpdate } from './transactionUtils';
import { supabase } from '@/integrations/supabase/client';

export const useCryptoStatusCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  // Show detailed error message
  const handleStatusCheckError = (error: string) => {
    console.error('Status check error:', error);
    
    if (error.includes('Transaction not found')) {
      toast.error("Transaction not found", {
        description: "This transaction was not found in our database. Please refresh the page."
      });
    } else if (error.includes('API key') || error.includes('credentials')) {
      toast.error("API Configuration Issue", {
        description: "There's a problem with the CoinPayments API configuration. Please contact support."
      });
    } else if (error.includes('Network error')) {
      toast.error("Network Error", {
        description: "Unable to connect to the API. Please check your internet connection and try again."
      });
    } else {
      toast.error(`Error checking payment status`, {
        description: "Please try again later or contact support if the issue persists."
      });
    }
  };

  const checkTransactionStatus = async (transaction: Transaction): Promise<Transaction | null> => {
    if (!transaction || !transaction.id) {
      toast.error('Invalid transaction');
      return null;
    }
    
    if (transaction.payment_method !== 'coinpayments') {
      console.log('This is not a CoinPayments transaction');
      return null;
    }

    // Allow checking for all statuses now - we want to be able to fix stuck transactions
    if (transaction.token_sent) {
      console.log('Transaction tokens are already sent - no need to check status');
      return transaction;
    }

    try {
      setIsChecking(true);
      
      // Use a unique toast ID based on the transaction ID
      const toastId = `check-crypto-${transaction.id}`;
      toast.info("Checking payment status...", {
        id: toastId,
      });
      
      console.log(`Initiating status check for transaction ${transaction.id}`);
      
      // Get status from API
      const result = await checkCryptoPaymentStatus(transaction.id);
      
      console.log(`Status check result for ${transaction.id}:`, result);
      
      toast.dismiss(toastId);
      
      if (result.error) {
        handleStatusCheckError(result.error);
        return null;
      }
      
      // Update and return transaction with new status info
      const updatedTransaction = mapTransactionStatus(transaction, result);
      
      // Show appropriate message based on status
      handleTransactionUpdate(
        transaction, 
        result.status,
        result.external_status_text, 
        result.updated
      );
      
      // Refresh the transaction from Supabase to make sure we have the latest data
      if (result.updated) {
        try {
          const { data: refreshedTransaction, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', transaction.id)
            .single();
            
          if (error) {
            console.error('Error refreshing transaction data:', error);
            // Continue with the locally updated transaction
          } else if (refreshedTransaction) {
            return refreshedTransaction as Transaction;
          }
        } catch (refreshError) {
          console.error('Error refreshing transaction data:', refreshError);
          // Continue with the locally updated transaction
        }
      }
      
      return updatedTransaction;
    } catch (err) {
      console.error('Exception in checkTransactionStatus:', err);
      toast.dismiss(`check-crypto-${transaction.id}`);
      toast.error('Error checking payment status');
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  // Function to manually trigger a refresh for all pending transactions
  const refreshAllPendingTransactions = async (forceUpdate = false): Promise<boolean> => {
    try {
      setIsChecking(true);
      
      const toastId = 'refresh-all-crypto';
      toast.info(forceUpdate ? 'Force updating all transactions...' : 'Refreshing all pending transactions...', {
        id: toastId,
      });
      
      // Get all pending coinpayments transactions for the current user
      const pendingTransactions = await getPendingTransactions();
      
      if (!pendingTransactions || pendingTransactions.length === 0) {
        toast.dismiss(toastId);
        toast.info('No pending crypto transactions found');
        return true;
      }
      
      console.log(`Found ${pendingTransactions.length} transactions to refresh`);
      
      // Process each transaction
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const tx of pendingTransactions) {
        console.log(`Checking status for transaction: ${tx.id}`);
        
        try {
          // Use force update if requested
          const result = await checkCryptoPaymentStatus(tx.id, forceUpdate);
          
          if (result.error) {
            errorCount++;
            console.error(`Error checking transaction ${tx.id}: ${result.error}`);
            continue;
          }
          
          if (result.updated) {
            console.log(`Transaction ${tx.id} status updated: ${tx.status} -> ${result.status}`);
            updatedCount++;
          }
        } catch (txError) {
          errorCount++;
          console.error(`Exception checking transaction ${tx.id}:`, txError);
          // Continue with other transactions even if one fails
        }
      }
      
      toast.dismiss(toastId);
      
      if (updatedCount > 0) {
        toast.success(`Updated ${updatedCount} transaction(s)`, {
          description: 'Transaction statuses have been synchronized with the payment provider.'
        });
        return true;
      } else if (errorCount > 0) {
        toast.warning(`No updates, but ${errorCount} error(s) occurred`, {
          description: 'Some transactions could not be checked. Try again later or contact support.'
        });
        return false;
      } else {
        toast.info(forceUpdate ? 'No transactions updated' : 'No changes needed', {
          description: forceUpdate 
            ? 'No transactions needed updating.'
            : 'All transaction statuses are up-to-date.'
        });
        return true;
      }
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
      
      const toastId = `force-update-crypto-${transaction.id}`;
      toast.info("Force updating payment status...", {
        id: toastId,
      });
      
      console.log(`Force updating transaction ${transaction.id}`);
      
      // Call API with force update flag
      const result = await checkCryptoPaymentStatus(transaction.id, true);
      
      toast.dismiss(toastId);
      
      if (result.error) {
        handleStatusCheckError(result.error);
        return null;
      }
      
      // Update transaction with new status
      const updatedTransaction = mapTransactionStatus(transaction, result);
      
      // Show appropriate result message
      if (result.updated) {
        toast.success('Payment status updated', {
          description: `Status changed to: ${result.status}`
        });
        
        // Refresh the transaction from Supabase to make sure we have the latest data
        try {
          const { data: refreshedTransaction, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', transaction.id)
            .single();
            
          if (error) {
            console.error('Error refreshing transaction data:', error);
            // Continue with the locally updated transaction
          } else if (refreshedTransaction) {
            return refreshedTransaction as Transaction;
          }
        } catch (refreshError) {
          console.error('Error refreshing transaction data:', refreshError);
          // Continue with the locally updated transaction
        }
      } else {
        toast.info('No status change needed', {
          description: `Current status: ${result.external_status_text || result.status}`
        });
      }
      
      return updatedTransaction;
    } catch (err) {
      console.error('Exception in forceUpdateTransaction:', err);
      toast.dismiss(`force-update-crypto-${transaction.id}`);
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
