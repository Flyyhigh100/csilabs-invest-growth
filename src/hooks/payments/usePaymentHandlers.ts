
import { useState } from 'react';
import { toast } from 'sonner';
import { useStripePayment } from './useStripePayment';
import { useCryptoPayments } from './useCryptoPayments';
import { usePaymentValidation } from './usePaymentValidation';
import { CryptoPaymentDetails, UsePaymentHandlersReturn } from './types';

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

  // Fix return type to match interface
  const handleStripePayment = async (amount: number): Promise<boolean> => {
    return processStripePayment(amount);
  };
  
  // Wrapper for coin payments to handle dialog display
  const handleCoinPaymentsPayment = async (amount: number, currency: string = 'USDT'): Promise<boolean> => {
    const success = await processCoinPayment(amount, currency);
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
  const handleCryptoPayment = async (amount: number): Promise<boolean> => {
    const success = await processCryptoPayment(amount);
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
    kycRequired
  };
};
