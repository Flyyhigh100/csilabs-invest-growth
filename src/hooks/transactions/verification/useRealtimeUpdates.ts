
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VerificationOptions } from './types';
import { Transaction } from '@/types/transactions';

/**
 * Hook to set up realtime subscription for transaction updates
 */
export const useRealtimeUpdates = (
  options: VerificationOptions,
  setTransaction: (tx: Transaction) => void,
  setHasCheckedStatus: (value: boolean) => void
) => {
  const { sessionId, userId } = options;
  
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
              import('sonner').then(({ toast }) => {
                toast.success('Payment status updated', {
                  description: 'Your payment has been confirmed!'
                });
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
  }, [sessionId, userId, setTransaction, setHasCheckedStatus]);

  // Effect for realtime updates
  useEffect(() => {
    const cleanupFn = setupRealtimeUpdates();
    return cleanupFn;
  }, [setupRealtimeUpdates]);

  return { setupRealtimeUpdates };
};
