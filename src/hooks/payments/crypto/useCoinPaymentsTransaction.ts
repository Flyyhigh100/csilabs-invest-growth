
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePaymentCreation } from './usePaymentCreation';
import { usePaymentValidation } from '../usePaymentValidation';

/**
 * Hook for handling CoinPayments transactions
 */
export const useCoinPaymentsTransaction = (walletAddress: string | null) => {
  const { 
    isProcessing, 
    setIsProcessing, 
    cryptoPaymentDetails, 
    setCryptoPaymentDetails,
    formatPaymentDetails,
    validateWalletAddress 
  } = usePaymentCreation(walletAddress);
  
  const { validatePaymentRequest } = usePaymentValidation(walletAddress);

  /**
   * Create a CoinPayments payment using the edge function
   */
  const handleCoinPaymentsPayment = async (
    amount: number, 
    currency: string = 'USDT', 
    currentTokenPrice?: number
  ) => {
    if (!validatePaymentRequest(amount, { isCrypto: true })) return false;
    if (!validateWalletAddress()) return false;
    
    setIsProcessing(true);
    console.log(`Creating CoinPayments payment for ${amount} ${currency}`);
    
    try {
      toast.info("Creating crypto payment...", {
        id: "crypto-preparing",
        description: `Preparing ${currency} payment session.`,
      });
      
      const { data, error } = await supabase.functions.invoke('create-coinpayments-payment', {
        body: { 
          amount, 
          walletAddress, 
          currency,
          tokenPrice: currentTokenPrice
        }
      });
      
      toast.dismiss("crypto-preparing");
      
      if (error || !data?.success) {
        throw new Error(error?.message || data?.message || "Failed to create payment");
      }

      console.log('CoinPayments payment data received:', data);

      const paymentDetails = formatPaymentDetails(data, amount, currency, currentTokenPrice);
      setCryptoPaymentDetails(paymentDetails);
      
      toast.success(`${currency} Payment Ready`, {
        description: "Follow the payment instructions to complete your purchase.",
        duration: 5000,
      });
      
      return true;
    } catch (error: any) {
      console.error("CoinPayments error:", error);
      toast.error("Payment creation failed", {
        description: error.message || "Unable to create payment. Please try again.",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleCoinPaymentsPayment,
    cryptoPaymentDetails,
    isProcessing
  };
};
