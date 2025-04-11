
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Transaction } from '@/types/transactions';
import { useStripeFallbackCheck } from '@/hooks/payments/useStripeFallbackCheck';
import { useVerificationState, useVerificationActions } from './verification/useVerificationState';
import { useTransactionApi } from './verification/useTransactionApi';
import { useRealtimeUpdates } from './verification/useRealtimeUpdates';
import { useStoredDataCheck } from './verification/useStoredDataCheck';
import { useSessionCheck } from './verification/useSessionCheck';
import { VerificationOptions } from './verification/types';

export const useTransactionVerification = ({ 
  sessionId, 
  success, 
  userId,
  refreshSession
}: VerificationOptions) => {
  // Get state and utils from smaller hooks
  const state = useVerificationState();
  const { transaction, isRefreshing } = state;
  const { verifyTransaction } = useTransactionApi();
  const { verifyPendingPayment, isVerifying } = useStripeFallbackCheck();
  const actions = useVerificationActions(state);
  const { setTransaction, setIsRefreshing, setHasCheckedStatus } = actions;
  
  // Function to handle manual refresh with fallback verification
  const handleRefresh = useCallback(async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    try {
      console.log("Manually refreshing transactions...");
      await refreshSession();
      
      // If we have a specific session ID to check
      if (sessionId) {
        const tx = await verifyTransaction(sessionId);
        if (tx) {
          // If transaction is still pending, try direct Stripe verification
          if (tx.status === 'pending' && tx.external_transaction_id) {
            console.log(`Transaction still pending, attempting direct Stripe verification`);
            toast.info("Verifying payment status directly with Stripe...");
            
            const updatedTx = await verifyPendingPayment(tx);
            if (updatedTx) {
              setTransaction(updatedTx);
              if (updatedTx.status === 'completed') {
                toast.success("Payment verified successfully!");
              }
            } else {
              setTransaction(tx);
              toast.info("Payment status check complete");
            }
          } else {
            setTransaction(tx);
            toast.success("Transaction data refreshed");
          }
        } else {
          toast.info("Transaction still processing", {
            description: "Your payment may still be processing. Please check back soon."
          });
        }
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      toast.error("Failed to refresh transactions");
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, sessionId, refreshSession, verifyTransaction, verifyPendingPayment, setTransaction, setIsRefreshing]);

  // Function to check a stored transaction
  const checkStoredTransaction = useCallback(async (storedSessionId: string) => {
    try {
      const txData = await verifyTransaction(storedSessionId);
      if (txData) {
        console.log("Found transaction using stored session ID:", txData);
        setTransaction(txData);
        setHasCheckedStatus(true);
        
        // Check if transaction is still pending but we have payment intent info
        if (txData.status === 'pending' && txData.external_transaction_id) {
          console.log("Transaction is still pending, will try direct verification");
          const updatedTx = await verifyPendingPayment(txData);
          if (updatedTx && updatedTx.status === 'completed') {
            setTransaction(updatedTx);
          }
        }
        
        // Clean up localStorage if we found the transaction
        localStorage.removeItem('stripe_session_data');
        return;
      }
      
      // If we get here, we didn't find a transaction for the stored session ID
      if (!state.hasCheckedStatus) {
        setTimeout(() => {
          actions.setPollingCount(prev => prev + 1);
        }, 2000);
      }
    } catch (err) {
      console.error("Error in stored transaction check:", err);
    }
  }, [verifyTransaction, verifyPendingPayment, setTransaction, setHasCheckedStatus, state.hasCheckedStatus, actions]);

  // Set up the hooks that need checkStoredTransaction
  useStoredDataCheck({ sessionId, success, userId, refreshSession }, checkStoredTransaction);
  useRealtimeUpdates({ sessionId, success, userId, refreshSession }, setTransaction, setHasCheckedStatus);
  useSessionCheck(
    { sessionId, success, userId, refreshSession },
    state,
    verifyTransaction,
    actions,
    handleRefresh
  );

  // Effect to handle initial success/cancel messages
  useEffect(() => {
    if (success === 'true' && !sessionId) {
      toast.success("Payment successful!");
    }
  }, [success, sessionId]);

  return {
    transaction,
    isRefreshing: isRefreshing || isVerifying,
    hasCheckedStatus: state.hasCheckedStatus,
    handleRefresh
  };
};

// Import the required dependencies
import { useEffect } from 'react';
