
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type CryptoPaymentDetails = {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
} | null;

export const usePaymentHandlers = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCryptoDialog, setShowCryptoDialog] = useState(false);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<CryptoPaymentDetails>(null);

  const validatePaymentRequest = (amount: number): boolean => {
    if (!walletAddress) {
      toast.error("Please add a wallet address before proceeding with payment");
      return false;
    }
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }
    
    return true;
  };

  const handleStripePayment = async (amount: number) => {
    if (!validatePaymentRequest(amount)) return;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { amount, walletAddress }
      });
      
      if (error) throw error;
      
      if (data.url) {
        toast.info("Redirecting to Stripe checkout...");
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating Stripe checkout:", error);
      toast.error("Failed to create payment session. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCryptoPayment = async (amount: number) => {
    if (!validatePaymentRequest(amount)) return;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { amount, walletAddress }
      });
      
      if (error) throw error;
      
      setCryptoPaymentDetails({
        paymentAddress: data.paymentAddress,
        transactionId: data.transactionId,
        instructions: data.instructions
      });
      
      setShowCryptoDialog(true);
    } catch (error) {
      console.error("Error creating crypto payment:", error);
      toast.error("Failed to create crypto payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    showCryptoDialog,
    setShowCryptoDialog,
    cryptoPaymentDetails,
    handleStripePayment,
    handleCryptoPayment
  };
};
