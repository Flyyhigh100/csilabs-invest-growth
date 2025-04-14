
import { useCallback, useEffect, useRef } from 'react';
import { VerificationOptions, VerificationState } from './types';
import { Transaction } from '@/types/transactions';
import { useStripeFallbackCheck } from '@/hooks/payments/useStripeFallbackCheck';
import { usePollingLogic } from './usePollingLogic';

/**
 * Hook to check the current session transaction status
 */
export const useSessionCheck = (
  options: VerificationOptions,
  state: VerificationState,
  verifyTransaction: (id: string) => Promise<Transaction | null>,
  setState: {
    setTransaction: (tx: Transaction | null) => void;
    setIsRefreshing: (value: boolean) => void;
    setHasCheckedStatus: (value: boolean) => void;
    setPollingCount: (value: React.SetStateAction<number>) => void;
  },
  handleRefresh: () => Promise<void>
) => {
  const { sessionId, success, userId } = options;
  const { hasCheckedStatus, pollingCount } = state;
  const { setTransaction, setIsRefreshing, setHasCheckedStatus, setPollingCount } = setState;
  
  const { verifyPendingPayment } = useStripeFallbackCheck();
  const { handlePendingTransaction, scheduleNextPoll } = usePollingLogic(
    state, 
    setPollingCount,
    setHasCheckedStatus
  );
  
  // Use a ref to track if we've shown success message to prevent duplicates
  const successMessageShown = useRef(false);

  // Function to check current session transaction status
  const checkSessionTransaction = useCallback(async () => {
    if (!sessionId || !userId || hasCheckedStatus) return;
    
    try {
      console.log(`Checking transaction status for session ${sessionId}...`);
      setIsRefreshing(true);
      
      // Check if the transaction exists and update UI accordingly
      const txData = await verifyTransaction(sessionId);
      
      if (txData) {
        setTransaction(txData);
        console.log("Transaction found:", txData.status, txData);
        
        if (txData.status === 'completed') {
          // Transaction is completed, show success message once
          if (success === 'true' && !successMessageShown.current) {
            successMessageShown.current = true;
            import('sonner').then(({ toast }) => {
              // We already show a notification in StatusChecks.tsx, so we don't need another one here
              // This prevents duplicate notifications
            });
          }
          setHasCheckedStatus(true);
          
          // Clean up localStorage if we found the transaction
          localStorage.removeItem('stripe_session_data');
        } else if (txData.status === 'pending' && success === 'true') {
          // If transaction is pending but we have payment intent ID, try direct verification
          if (txData.external_transaction_id) {
            console.log("Transaction is pending but Stripe reports success - trying direct verification");
            const updatedTx = await verifyPendingPayment(txData);
            if (updatedTx && updatedTx.status === 'completed') {
              setTransaction(updatedTx);
              setHasCheckedStatus(true);
              return;
            }
          }
          handlePendingTransaction(handleRefresh);
        }
      } else {
        console.log("No transaction found for session ID:", sessionId);
        
        // If success is true but no transaction found, show a message only once
        if (success === 'true' && pollingCount === 0) {
          // Reduce duplicate notifications
          // We already show a notification in StatusChecks.tsx, so we don't need another one here
        }
        
        // Poll with exponential backoff
        if (pollingCount < 5) {
          scheduleNextPoll();
          return;
        }
      }
      
      if (pollingCount >= 5) {
        setHasCheckedStatus(true);
      }
      setIsRefreshing(false);
    } catch (err) {
      console.error("Error in transaction check:", err);
      setIsRefreshing(false);
    }
  }, [
    sessionId, 
    success, 
    userId, 
    hasCheckedStatus, 
    pollingCount, 
    verifyTransaction, 
    verifyPendingPayment,
    setTransaction,
    setIsRefreshing,
    setHasCheckedStatus,
    handlePendingTransaction,
    scheduleNextPoll,
    handleRefresh
  ]);

  // Effect to check transaction status
  useEffect(() => {
    if (sessionId && !hasCheckedStatus && userId) {
      checkSessionTransaction();
    }
  }, [sessionId, hasCheckedStatus, userId, pollingCount, checkSessionTransaction]);

  return { checkSessionTransaction };
};
