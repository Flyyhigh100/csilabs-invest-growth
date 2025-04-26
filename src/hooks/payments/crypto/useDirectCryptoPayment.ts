
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePaymentValidation } from '../usePaymentValidation';
import { usePaymentCreation } from './usePaymentCreation';
import { CryptoPaymentDetails } from '../types';

/**
 * Hook for handling direct crypto payments (USDC)
 */
export const useDirectCryptoPayment = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { validatePaymentRequest } = usePaymentValidation(walletAddress);
  const { validateWalletAddress, formatPaymentDetails } = usePaymentCreation(walletAddress);

  /**
   * Create a direct crypto payment using the edge function
   */
  const handleDirectCryptoPayment = async (amount: number, currentTokenPrice?: number): Promise<boolean> => {
    if (!validatePaymentRequest(amount, { isCrypto: true })) return false;
    if (!validateWalletAddress()) return false;
    
    setIsProcessing(true);
    
    try {
      toast.info("Creating crypto payment...", {
        id: "direct-crypto-preparing",
        description: "Preparing USDC payment session. Please wait..."
      });
      
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { 
          amount, 
          walletAddress,
          tokenPrice: currentTokenPrice
        }
      });
      
      toast.dismiss("direct-crypto-preparing");
      
      if (error || !data) {
        throw new Error(error?.message || "Failed to create payment");
      }

      const paymentDetails = formatPaymentDetails(data, amount, 'USDC', currentTokenPrice);
      
      toast.success("USDC Payment Ready", {
        description: "Follow the instructions to complete your purchase.",
        duration: 5000,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error creating crypto payment:", error);
      toast.error("Crypto payment failed", {
        description: error.message || "Unable to create payment request. Please try again.",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleDirectCryptoPayment,
    isProcessing
  };
};
