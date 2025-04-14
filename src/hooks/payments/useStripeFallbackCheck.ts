
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Transaction } from '@/types/transactions';

export function useStripeFallbackCheck() {
  const [isVerifying, setIsVerifying] = useState(false);
  
  const verifyPendingPayment = async (transaction: Transaction): Promise<Transaction | null> => {
    if (!transaction || !transaction.id) {
      return null;
    }
    
    // Only perform verification for Stripe transactions with payment intent IDs
    if (transaction.payment_method !== 'stripe' || !transaction.external_transaction_id) {
      return null;
    }
    
    try {
      setIsVerifying(true);
      console.log(`Verifying payment status for transaction ${transaction.id} with payment intent ${transaction.external_transaction_id}`);
      
      const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
        body: {
          transactionId: transaction.id,
          paymentIntentId: transaction.external_transaction_id
        }
      });
      
      if (error) {
        console.error('Error verifying payment:', error);
        return null;
      }
      
      if (data.updated) {
        toast.success('Payment verified successfully', {
          description: 'Your payment has been confirmed'
        });
        
        // Return the updated transaction data
        return data.transaction || null;
      } else {
        console.log('Payment verification response:', data);
      }
      
      return null;
    } catch (err) {
      console.error('Exception in verifyPendingPayment:', err);
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
