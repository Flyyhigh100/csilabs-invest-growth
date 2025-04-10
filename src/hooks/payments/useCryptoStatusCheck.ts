
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

interface CryptoStatusCheckResult {
  status: string;
  updated: boolean;
  external_status?: number;
  external_status_text?: string;
  error?: string;
}

export const useCryptoStatusCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkTransactionStatus = async (transaction: Transaction): Promise<Transaction | null> => {
    if (!transaction || !transaction.id) {
      toast.error('Invalid transaction');
      return null;
    }
    
    if (transaction.payment_method !== 'coinpayments') {
      console.log('This is not a CoinPayments transaction');
      return null;
    }

    if (transaction.status === 'completed') {
      console.log('Transaction is already completed');
      return transaction;
    }

    try {
      setIsChecking(true);
      
      toast.info('Checking payment status...', {
        id: 'check-crypto-status',
      });
      
      const { data: result, error } = await supabase.functions.invoke('check-coinpayments-status', {
        body: {
          transactionId: transaction.id
        }
      }) as { data: CryptoStatusCheckResult, error: any };
      
      if (error) {
        toast.dismiss('check-crypto-status');
        console.error('Error checking crypto payment status:', error);
        toast.error('Failed to check payment status', {
          description: error.message || 'Please try again later'
        });
        return null;
      }
      
      toast.dismiss('check-crypto-status');
      
      if (result.error) {
        toast.error('Failed to check payment status', {
          description: result.error
        });
        return null;
      }
      
      // If the transaction was updated, show appropriate message
      if (result.updated) {
        if (result.status === 'completed') {
          toast.success('Payment confirmed!', {
            description: 'Your crypto payment has been confirmed. Your tokens will be sent to your wallet shortly.'
          });
        } else if (result.status === 'failed') {
          toast.error('Payment failed', {
            description: 'Your crypto payment transaction has failed or was canceled.'
          });
        }
        
        // Return updated transaction data
        return {
          ...transaction,
          status: result.status
        };
      } else {
        if (transaction.status === 'pending') {
          toast.info('Payment still pending', {
            description: 'Your payment is still being processed. Please check back later.'
          });
        }
        return transaction;
      }
    } catch (err) {
      console.error('Exception in checkTransactionStatus:', err);
      toast.error('Error checking payment status');
      return null;
    } finally {
      setIsChecking(false);
    }
  };
  
  return {
    checkTransactionStatus,
    isChecking
  };
};
