
import { useState } from 'react';
import { useStripePayment } from './useStripePayment';
import { useCryptoPayments } from './useCryptoPayments';
import { usePaymentValidation } from './usePaymentValidation';
import { CryptoPaymentDetails, UsePaymentHandlersProps, UsePaymentHandlersReturn } from './types';

export const usePaymentHandlers = (walletAddress: string | null): UsePaymentHandlersReturn => {
  const [showCryptoDialog, setShowCryptoDialog] = useState(false);
  const { kycRequired } = usePaymentValidation(walletAddress);
  
  // Get payment method specific handlers
  const { 
    handleStripePayment, 
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

  // Wrapper for coin payments to handle dialog display
  const handleCoinPaymentsPayment = async (amount: number, currency: string = 'USDT') => {
    const success = await processCoinPayment(amount, currency);
    if (success) {
      setShowCryptoDialog(true);
      
      // Show success toast
      toast.success("Payment instructions ready", {
        description: `Please follow the instructions to complete your ${currency} payment.`
      });
    }
  };
  
  // Wrapper for crypto payments to handle dialog display
  const handleCryptoPayment = async (amount: number) => {
    const success = await processCryptoPayment(amount);
    if (success) {
      setShowCryptoDialog(true);
      
      // Show success toast
      toast.success("Payment instructions ready", {
        description: "Please follow the instructions to complete your USDC payment."
      });
    }
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

// Re-export from index.ts to maintain the existing import paths
import { toast } from 'sonner';
