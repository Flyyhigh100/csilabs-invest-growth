
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
    
    // Clear any existing payment details
    setCryptoPaymentDetails(null);
    
    try {
      toast.info("Creating crypto payment...", {
        id: "crypto-preparing",
        description: `Preparing ${currency} payment session.`,
      });
      
      // Generate a unique transaction ID for tracking
      const localTxId = crypto.randomUUID();
      
      // Call the edge function with better error handling
      const { data, error } = await supabase.functions.invoke('create-coinpayments-payment', {
        body: { 
          amount, 
          walletAddress, 
          currency,
          tokenPrice: currentTokenPrice,
          localTransactionId: localTxId
        }
      });
      
      toast.dismiss("crypto-preparing");
      
      console.log('Response from edge function:', data);
      
      if (error) {
        console.error('Error from edge function:', error);
        throw new Error(error.message || "Failed to create payment");
      }
      
      if (!data?.success) {
        console.error('Error in payment response:', data);
        throw new Error(data?.message || "Failed to create payment");
      }

      console.log('CoinPayments payment data received:', data);

      // Format payment details with comprehensive information
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
