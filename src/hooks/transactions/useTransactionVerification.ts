
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

interface VerificationOptions {
  sessionId: string | null;
  success: string | null;
  userId: string | undefined;
  refreshSession: () => Promise<void>;
}

export const useTransactionVerification = ({ 
  sessionId, 
  success, 
  userId,
  refreshSession
}: VerificationOptions) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  // Function to verify a transaction by ID
  const verifyTransaction = useCallback(async (id: string) => {
    try {
      console.log(`Checking transaction with ID: ${id}`);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching transaction:", error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error("Error in transaction verification:", err);
      return null;
    }
  }, []);

  // Function to handle manual refresh
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
          setTransaction(tx);
          toast.success("Transaction data refreshed");
        } else {
          toast.info("Transaction still processing", {
            description: "Your payment may still be processing. Please check back soon."
          });
        }
      }
      
      toast.success("Transactions refreshed");
    } catch (err) {
      console.error("Error refreshing data:", err);
      toast.error("Failed to refresh transactions");
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, sessionId, refreshSession, verifyTransaction]);

  // Function to set up realtime subscription for transaction updates
  const setupRealtimeUpdates = useCallback(() => {
    if (!sessionId || !userId) return () => {};
    
    // Subscribe to updates for this specific transaction
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `transaction_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Realtime transaction update received:', payload);
          
          // Check if the payload has a new object with a status property
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            // If the transaction status changed to completed, update our state
            if (payload.new.status === 'completed') {
              setTransaction(payload.new as Transaction);
              setHasCheckedStatus(true);
              
              // Show a toast notification when the status changes to completed
              toast.success('Payment status updated', {
                description: 'Your payment has been confirmed!'
              });
              
              // Clean up localStorage
              localStorage.removeItem('stripe_session_data');
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, userId]);

  // Function to check for stored Stripe session data
  const checkStoredStripeData = useCallback(() => {
    const stripeData = localStorage.getItem('stripe_session_data');
    if (!stripeData) return;

    try {
      const data = JSON.parse(stripeData);
      console.log("Found Stripe session data in localStorage:", {
        session_id: data.session_id,
        payment_intent: data.payment_intent,
        timestamp: new Date(data.timestamp).toISOString(),
        amount: data.amount,
        wallet_address: data.wallet_address
      });
      
      // If we returned from Stripe with success but no transaction found,
      // we could use this data to recover and verify the transaction
      if (success === 'true' && !sessionId && data.session_id) {
        console.log("Success param without session_id, using stored session:", data.session_id);
        checkStoredTransaction(data.session_id);
      }
    } catch (e) {
      console.error("Error parsing Stripe session data:", e);
    }
  }, [success, sessionId, verifyTransaction]);

  // Function to check a stored transaction
  const checkStoredTransaction = useCallback(async (storedSessionId: string) => {
    try {
      const txData = await verifyTransaction(storedSessionId);
      if (txData) {
        console.log("Found transaction using stored session ID:", txData);
        setTransaction(txData);
        setHasCheckedStatus(true);
        
        // Clean up localStorage if we found the transaction
        localStorage.removeItem('stripe_session_data');
        return;
      }
      
      // If we get here, we didn't find a transaction for the stored session ID
      // This might be a case where the webhook hasn't processed yet
      // Set up polling to check again
      if (!hasCheckedStatus) {
        setTimeout(() => {
          setPollingCount(prev => prev + 1);
        }, 2000);
      }
    } catch (err) {
      console.error("Error in stored transaction check:", err);
    }
  }, [verifyTransaction, hasCheckedStatus]);

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
          // Transaction is completed, show success message
          if (success === 'true') {
            toast.success("Payment successful!", {
              description: "Your tokens will be sent to your wallet shortly."
            });
          }
          setHasCheckedStatus(true);
          
          // Clean up localStorage if we found the transaction
          localStorage.removeItem('stripe_session_data');
        } else if (txData.status === 'pending' && success === 'true') {
          handlePendingTransaction();
        }
      } else {
        console.log("No transaction found for session ID:", sessionId);
        
        // If success is true but no transaction found, show a message
        if (success === 'true' && pollingCount === 0) {
          toast.info("Checking payment status...", {
            description: "Please wait while we verify your payment."
          });
          
          // Poll with exponential backoff
          if (pollingCount < 5) {
            scheduleNextPoll();
            return;
          }
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
  }, [sessionId, success, userId, hasCheckedStatus, pollingCount, verifyTransaction]);

  // Helper function to handle pending transactions
  const handlePendingTransaction = useCallback(() => {
    // Transaction is still pending but Stripe says success, wait and check again
    if (pollingCount === 0) {
      toast.info("Verifying your payment...", {
        description: "This may take a moment, please wait."
      });
    }
    
    // Poll with exponential backoff
    if (pollingCount < 5) {
      scheduleNextPoll();
    } else {
      // After several polling attempts, suggest manual refresh
      toast.info("Payment processing may take longer than expected", {
        description: "You can manually refresh to check status updates.",
        action: {
          label: "Refresh",
          onClick: handleRefresh
        }
      });
      setHasCheckedStatus(true);
    }
  }, [pollingCount, handleRefresh]);

  // Helper function to schedule the next polling attempt
  const scheduleNextPoll = useCallback(() => {
    const delay = Math.min(2000 * Math.pow(1.5, pollingCount), 10000);
    console.log(`Payment still pending. Will check again in ${delay}ms (attempt ${pollingCount + 1})`);
    
    setTimeout(() => {
      setPollingCount(prev => prev + 1);
    }, delay);
  }, [pollingCount]);

  // Effect for realtime updates
  useEffect(() => {
    const cleanupFn = setupRealtimeUpdates();
    return cleanupFn;
  }, [setupRealtimeUpdates]);

  // Effect to check stored Stripe data
  useEffect(() => {
    checkStoredStripeData();
  }, [checkStoredStripeData]);

  // Effect to check transaction status
  useEffect(() => {
    if (sessionId && !hasCheckedStatus && userId) {
      checkSessionTransaction();
    }
  }, [sessionId, hasCheckedStatus, userId, pollingCount, checkSessionTransaction]);

  // Effect to handle initial success/cancel messages
  useEffect(() => {
    if (success === 'true' && !sessionId) {
      toast.success("Payment successful!");
    }
  }, [success, sessionId]);

  return {
    transaction,
    isRefreshing,
    hasCheckedStatus,
    handleRefresh
  };
};
