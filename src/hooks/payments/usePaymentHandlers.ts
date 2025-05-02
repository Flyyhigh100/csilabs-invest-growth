
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

  // Wrapper for Stripe Crypto Onramp with enhanced error handling
  const handleStripeCryptoOnramp = async (amount: number, currentTokenPrice?: number): Promise<StripeCryptoOnrampResult> => {
    try {
      // Validate wallet address before proceeding
      if (!walletAddress) {
        toast.error("Wallet Address Required", {
          description: "You need to add a wallet address before making a purchase."
        });
        return { 
          success: false, 
          error: "Wallet address required",
          details: "Please add a wallet address in your profile settings."
        };
      }
      
      console.log(`Initiating Stripe Crypto Onramp purchase: $${amount} → ${walletAddress}`);
      const result = await processStripeCryptoOnramp(amount, currentTokenPrice);
      
      // Log result details for debugging
      if (!result.success) {
        console.error("Stripe Crypto Onramp failed:", result);
        
        // Handle specific error types
        if (result.error?.includes("API key") || result.error?.includes("permission")) {
          toast.error("Payment configuration error", {
            description: "The Stripe Crypto API is not properly configured."
          });
        } else {
          toast.error("Payment initialization failed", {
            description: result.error || "Please try again or contact support"
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error in Stripe Crypto Onramp handler:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast.error("Payment system error", {
        description: "An unexpected error occurred while setting up your payment."
      });
      
      return { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : "Unknown error occurred during payment setup"
      };
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
