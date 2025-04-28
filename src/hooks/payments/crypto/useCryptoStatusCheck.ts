import { useState, useCallback } from 'react';
import { Transaction } from '@/types/transactions';
import { checkTransactionStatus, forceUpdateTransaction } from './cryptoStatusService';
import { getPendingTransactions } from './transactionRepository';
import { toast } from 'sonner';
import { CryptoStatusCheckResult } from './types';
import { showSmartNotification } from '@/utils/notification/smartNotifications';

export function useCryptoStatusCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<CryptoStatusCheckResult | null>(null);

  const checkStatus = useCallback(async (transaction: Transaction): Promise<Transaction | null> => {
    if (!transaction || !transaction.id) {
      showSmartNotification(
        'Invalid transaction',
        'Transaction details are missing',
        { type: 'error', priority: 'high' }
      );
      return null;
    }
    
    if (isChecking) {
      return null;
    }
    
    try {
      setIsChecking(true);
      const updatedTransaction = await checkTransactionStatus(transaction);
      setLastCheckResult({
        status: updatedTransaction?.status || 'error',
        updated: !!updatedTransaction,
        transaction: updatedTransaction || undefined
      });
      return updatedTransaction;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      setLastCheckResult({
        status: 'error',
        updated: false,
        error: 'An unexpected error occurred'
      });
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  const forceUpdate = useCallback(async (transaction: Transaction): Promise<Transaction | null> => {
    if (!transaction || !transaction.id) {
      toast.error('Invalid transaction');
      return null;
    }
    
    if (isChecking) {
      toast.info('Already processing...');
      return null;
    }
    
    try {
      setIsChecking(true);
      const updatedTransaction = await forceUpdateTransaction(transaction);
      setLastCheckResult({
        status: updatedTransaction?.status || 'error',
        updated: !!updatedTransaction,
        transaction: updatedTransaction || undefined
      });
      return updatedTransaction;
    } catch (error) {
      console.error('Error forcing transaction update:', error);
      setLastCheckResult({
        status: 'error',
        updated: false,
        error: 'An unexpected error occurred while forcing update'
      });
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  const checkAllPendingTransactions = useCallback(async (): Promise<Transaction[]> => {
    try {
      setIsChecking(true);
      const pendingTransactions = await getPendingTransactions();
      
      if (!pendingTransactions || pendingTransactions.length === 0) {
        toast.info('No pending transactions found');
        return [];
      }
      
      toast.info(`Checking ${pendingTransactions.length} pending transactions...`);
      
      const updatedTransactions: Transaction[] = [];
      
      for (const transaction of pendingTransactions) {
        try {
          const updatedTransaction = await checkTransactionStatus(transaction);
          if (updatedTransaction) {
            updatedTransactions.push(updatedTransaction);
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Error checking transaction ${transaction.id}:`, err);
        }
      }
      
      toast.success(`Completed checking ${pendingTransactions.length} transactions`);
      return updatedTransactions;
    } catch (error) {
      console.error('Error in checkAllPendingTransactions:', error);
      toast.error('Failed to check pending transactions');
      return [];
    } finally {
      setIsChecking(false);
    }
  }, []);

  const refreshAllPendingTransactions = useCallback(async (forceUpdateAll: boolean = false): Promise<boolean> => {
    try {
      setIsChecking(true);
      const pendingTransactions = await getPendingTransactions();
      
      if (!pendingTransactions || pendingTransactions.length === 0) {
        toast.info('No pending transactions found');
        return true;
      }
      
      toast.info(`${forceUpdateAll ? 'Force updating' : 'Checking'} ${pendingTransactions.length} pending transactions...`);
      
      const updatedTransactions: Transaction[] = [];
      
      for (const transaction of pendingTransactions) {
        try {
          const updatedTransaction = forceUpdateAll 
            ? await forceUpdateTransaction(transaction)
            : await checkTransactionStatus(transaction);
            
          if (updatedTransaction) {
            updatedTransactions.push(updatedTransaction);
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Error processing transaction ${transaction.id}:`, err);
        }
      }
      
      const successMessage = forceUpdateAll 
        ? `Completed force updating ${pendingTransactions.length} transactions`
        : `Completed checking ${pendingTransactions.length} transactions`;
      
      toast.success(successMessage);
      return true;
    } catch (error) {
      console.error('Error in refreshAllPendingTransactions:', error);
      toast.error('Failed to process transactions');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    checkTransactionStatus: checkStatus,
    forceUpdateTransaction: forceUpdate,
    checkAllPendingTransactions,
    refreshAllPendingTransactions,
    isChecking,
    lastCheckResult
  };
}
