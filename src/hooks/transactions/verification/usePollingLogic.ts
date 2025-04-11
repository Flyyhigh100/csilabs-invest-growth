
import { useCallback } from 'react';
import { VerificationState } from './types';

/**
 * Hook to provide polling functionality for transaction verification
 */
export const usePollingLogic = (
  state: VerificationState,
  setPollingCount: (value: React.SetStateAction<number>) => void,
  setHasCheckedStatus: (value: React.SetStateAction<boolean>) => void
) => {
  const { pollingCount } = state;
  
  // Helper function to handle pending transactions
  const handlePendingTransaction = useCallback((refresh: () => Promise<void>) => {
    // Transaction is still pending but Stripe says success, wait and check again
    if (pollingCount === 0) {
      import('sonner').then(({ toast }) => {
        toast.info("Verifying your payment...", {
          description: "This may take a moment, please wait."
        });
      });
    }
    
    // Poll with exponential backoff
    if (pollingCount < 5) {
      scheduleNextPoll();
    } else {
      // After several polling attempts, suggest manual refresh
      import('sonner').then(({ toast }) => {
        toast.info("Payment processing may take longer than expected", {
          description: "You can manually refresh to check status updates.",
          action: {
            label: "Refresh",
            onClick: refresh
          }
        });
      });
      setHasCheckedStatus(true);
    }
  }, [pollingCount, setHasCheckedStatus]);

  // Helper function to schedule the next polling attempt
  const scheduleNextPoll = useCallback(() => {
    const delay = Math.min(2000 * Math.pow(1.5, pollingCount), 10000);
    console.log(`Payment still pending. Will check again in ${delay}ms (attempt ${pollingCount + 1})`);
    
    setTimeout(() => {
      setPollingCount(prev => prev + 1);
    }, delay);
  }, [pollingCount, setPollingCount]);

  return {
    scheduleNextPoll,
    handlePendingTransaction
  };
};
