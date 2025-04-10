
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Transaction } from '@/types/transactions';

// Type definitions for function returns
interface VerificationResponse {
  transaction: Transaction | null;
  message: string;
  status: string;
}

/**
 * Hook to provide direct Stripe payment status verification as a fallback
 * when webhooks may have failed to update transaction status
 */
export function useStripeFallbackCheck() {
  const [isVerifying, setIsVerifying] = useState(false);
  
  /**
   * Validates if a transaction can be verified
   */
  const canVerifyTransaction = (transaction: Transaction | null): boolean => {
    if (!transaction || transaction.status !== 'pending' || !transaction.external_transaction_id) {
      console.log('Cannot verify payment: Invalid transaction or not in pending state');
      return false;
    }
    return true;
  };

  /**
   * Calls the edge function to verify payment status
   */
  const callVerificationFunction = async (
    transactionId: string,
    paymentIntentId: string
  ): Promise<VerificationResponse | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
        body: {
          paymentIntentId,
          transactionId
        }
      });
      
      if (error) {
        console.error('Error verifying payment status:', error);
        toast.error('Could not verify payment status');
        return null;
      }
      
      console.log('Payment verification result:', data);
      return data;
    } catch (err) {
      console.error('Error calling verification function:', err);
      return null;
    }
  };

  /**
   * Handles the verification response and shows appropriate toast notifications
   */
  const handleVerificationResponse = (
    response: VerificationResponse | null, 
    originalTransaction: Transaction
  ): Transaction | null => {
    if (!response) return null;
    
    if (response.transaction) {
      // If status changed, show success message
      if (response.transaction.status !== originalTransaction.status) {
        toast.success('Payment status updated', {
          description: 'Your payment has been confirmed!'
        });
        return response.transaction;
      } else {
        toast.info('Payment status check complete', {
          description: 'No status change was needed.'
        });
        return originalTransaction;
      }
    }
    
    return null;
  };

  /**
   * Directly verify a pending transaction with Stripe via our edge function
   */
  const verifyPendingPayment = async (transaction: Transaction): Promise<Transaction | null> => {
    if (!canVerifyTransaction(transaction)) {
      return null;
    }
    
    try {
      setIsVerifying(true);
      console.log(`Requesting direct Stripe verification for payment: ${transaction.external_transaction_id}`);
      
      const response = await callVerificationFunction(
        transaction.id,
        transaction.external_transaction_id!
      );
      
      return handleVerificationResponse(response, transaction);
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
