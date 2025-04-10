
import { useState, useEffect } from 'react';
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
      toast.success("Transactions refreshed");
    } catch (err) {
      toast.error("Failed to refresh transactions");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check for stored Stripe session data
  useEffect(() => {
    const stripeData = localStorage.getItem('stripe_session_data');
    if (stripeData) {
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
          // Use stored session ID to check transaction
          const checkStoredTransaction = async () => {
            try {
              const { data: txData, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('transaction_id', data.session_id)
                .maybeSingle();
                
              if (error) {
                console.error("Error checking stored transaction:", error);
              } else if (txData) {
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
          };
          
          checkStoredTransaction();
        }
      } catch (e) {
        console.error("Error parsing Stripe session data:", e);
      }
    }
  }, [success, sessionId, pollingCount]);

  // Check session and transaction status
  useEffect(() => {
    if (sessionId && !hasCheckedStatus && userId) {
      const checkTransaction = async () => {
        try {
          console.log(`Checking transaction status for session ${sessionId}...`);
          setIsRefreshing(true);
          
          // Check if the transaction exists and update UI accordingly
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('transaction_id', sessionId)
            .maybeSingle();
          
          if (error) {
            console.error("Error checking transaction:", error);
            if (success === 'true' && pollingCount === 0) {
              toast.info("Checking payment status...", {
                description: "Please wait while we verify your payment."
              });
            }
          } else if (data) {
            setTransaction(data);
            console.log("Transaction found:", data.status, data);
            
            if (data.status === 'completed') {
              // Transaction is completed, show success message
              if (success === 'true') {
                toast.success("Payment successful!", {
                  description: "Your tokens will be sent to your wallet shortly."
                });
              }
              setHasCheckedStatus(true);
              
              // Clean up localStorage if we found the transaction
              localStorage.removeItem('stripe_session_data');
            } else if (data.status === 'pending' && success === 'true') {
              // Transaction is still pending but Stripe says success, wait and check again
              if (pollingCount === 0) {
                toast.info("Verifying your payment...", {
                  description: "This may take a moment, please wait."
                });
              }
              
              // Poll with exponential backoff
              if (pollingCount < 5) {
                const delay = Math.min(2000 * Math.pow(1.5, pollingCount), 10000);
                console.log(`Payment still pending. Will check again in ${delay}ms (attempt ${pollingCount + 1})`);
                
                setTimeout(() => {
                  setPollingCount(prev => prev + 1);
                  checkTransaction();
                }, delay);
                return;
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
                const delay = Math.min(2000 * Math.pow(1.5, pollingCount), 10000);
                setTimeout(() => {
                  setPollingCount(prev => prev + 1);
                  checkTransaction();
                }, delay);
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
      };
      
      checkTransaction();
    }
  }, [sessionId, success, userId, hasCheckedStatus, pollingCount, refreshSession]);

  // Handle initial success/cancel messages
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
