
import { useState } from 'react';
import { useStripeCryptoOnramp } from './useStripeCryptoOnramp';
import { useCryptoPayments } from './useCryptoPayments';
import { usePaymentValidation } from './usePaymentValidation';
import { CryptoPaymentDetails, UsePaymentHandlersProps, UsePaymentHandlersReturn, StripeCryptoOnrampResult } from './types';
import { toast } from 'sonner';

export const usePaymentHandlers = (walletAddress: string | null): UsePaymentHandlersReturn => {
  const [showCryptoDialog, setShowCryptoDialog] = useState(false);
  const { kycRequired } = usePaymentValidation(walletAddress);
  
  // Get payment method specific handlers
  const { 
    createOnrampSession: processStripeCryptoOnramp, 
    isProcessing: isStripeCryptoProcessing,
    setIsProcessing: setStripeCryptoProcessing
  } = useStripeCryptoOnramp(walletAddress);
  
  const {
    handleCoinPaymentsPayment: processCoinPayment,
    handleCryptoPayment: processCryptoPayment,
    cryptoPaymentDetails,
    isProcessing: isCryptoProcessing,
    setIsProcessing: setCryptoProcessing
  } = useCryptoPayments(walletAddress);

  const isProcessing = isStripeCryptoProcessing || isCryptoProcessing;

  // Wrapper for Stripe Crypto Onramp to return the complete result object, not just boolean
  const handleStripeCryptoOnramp = async (amount: number, currentTokenPrice?: number): Promise<StripeCryptoOnrampResult> => {
    try {
      const result = await processStripeCryptoOnramp(amount, currentTokenPrice);
      return result; // Return the complete result object
    } catch (error) {
      console.error("Error in Stripe Crypto Onramp:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
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
    handleStripeCryptoOnramp,
    handleCoinPaymentsPayment,
    handleCryptoPayment,
    kycRequired
  };
};
