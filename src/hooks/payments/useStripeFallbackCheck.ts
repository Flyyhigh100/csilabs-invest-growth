
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Transaction } from '@/types/transactions';

/**
 * Hook to provide direct Stripe payment status verification as a fallback
 * when webhooks may have failed to update transaction status
 */
export function useStripeFallbackCheck() {
  const [isVerifying, setIsVerifying] = useState(false);
  
  /**
   * Directly verify a pending transaction with Stripe via our edge function
   */
  const verifyPendingPayment = async (transaction: Transaction): Promise<Transaction | null> => {
    if (!transaction || transaction.status !== 'pending' || !transaction.external_transaction_id) {
      console.log('Cannot verify payment: Invalid transaction or not in pending state');
      return null;
    }
    
    try {
      setIsVerifying(true);
      console.log(`Requesting direct Stripe verification for payment: ${transaction.external_transaction_id}`);
      
      // Call an edge function to verify payment status directly with Stripe
      const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
        body: {
          paymentIntentId: transaction.external_transaction_id,
          transactionId: transaction.id
        }
      });
      
      if (error) {
        console.error('Error verifying payment status:', error);
        toast.error('Could not verify payment status');
        return null;
      }
      
      console.log('Payment verification result:', data);
      
      if (data?.transaction) {
        // If status changed, show success message
        if (data.transaction.status !== transaction.status) {
          toast.success('Payment status updated', {
            description: 'Your payment has been confirmed!'
          });
          return data.transaction;
        } else {
          toast.info('Payment status check complete', {
            description: 'No status change was needed.'
          });
          return transaction;
        }
      }
      
      return null;
    } catch (err) {
      console.error('Error in payment verification:', err);
      toast.error('Payment verification failed');
      return null;
    } finally {
      setIsVerifying(false);
    }
  };
  
  return {
    verifyPendingPayment,
    isVerifying
  };
}
