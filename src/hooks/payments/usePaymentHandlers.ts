
import { useState } from 'react';
import { useStripePayment } from './useStripePayment';
import { useCryptoPayments } from './useCryptoPayments';
import { usePaymentValidation } from './usePaymentValidation';
import { CryptoPaymentDetails, UsePaymentHandlersProps, UsePaymentHandlersReturn } from './types';
import { toast } from 'sonner';

export const usePaymentHandlers = (walletAddress: string | null): UsePaymentHandlersReturn => {
  const [showCryptoDialog, setShowCryptoDialog] = useState(false);
  const { kycRequired } = usePaymentValidation(walletAddress);
  
  // Get payment method specific handlers
  const { 
    handleStripePayment: processStripePayment, 
    isProcessing: isStripeProcessing,
    setIsProcessing: setStripeProcessing
  } = useStripePayment(walletAddress);
  
  const {
    handleCoinPaymentsPayment: processCoinPayment,
    handleCryptoPayment: processCryptoPayment,
    cryptoPaymentDetails,
    isProcessing: isCryptoProcessing,
    setIsProcessing: setCryptoProcessing
  } = useCryptoPayments(walletAddress);

  const isProcessing = isStripeProcessing || isCryptoProcessing;

  // Wrapper for Stripe payment to ensure it returns a boolean
  const handleStripePayment = async (amount: number, currentTokenPrice?: number): Promise<boolean> => {
    try {
      await processStripePayment(amount, currentTokenPrice);
      return true;
    } catch (error) {
      console.error("Error in Stripe payment:", error);
      return false;
    }
  };
  
  // Wrapper for coin payments to handle dialog display
  const handleCoinPaymentsPayment = async (amount: number, currency: string = 'USDT', currentTokenPrice?: number): Promise<boolean> => {
    const success = await processCoinPayment(amount, currency, currentTokenPrice);
    if (success) {
      setShowCryptoDialog(true);
      
      // Show success toast
      toast.success("Payment instructions ready", {
        description: `Please follow the instructions to complete your ${currency} payment.`
      });
    }
    return success;
  };
  
  // Wrapper for crypto payments to handle dialog display
  const handleCryptoPayment = async (amount: number, currentTokenPrice?: number): Promise<boolean> => {
    const success = await processCryptoPayment(amount, currentTokenPrice);
    if (success) {
      setShowCryptoDialog(true);
      
      // Show success toast
      toast.success("Payment instructions ready", {
        description: "Please follow the instructions to complete your USDC payment."
      });
    }
    return success;
  };

  return {
    isProcessing,
    showCryptoDialog,
    setShowCryptoDialog,
    cryptoPaymentDetails,
    handleStripePayment,
    handleCoinPaymentsPayment,
    handleCryptoPayment,
    kycRequired // This is now correctly passing the function from usePaymentValidation
  };
};
