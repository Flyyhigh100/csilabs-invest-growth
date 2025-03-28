
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type CryptoPaymentDetails = {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
  currency?: string;
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
      
      if (error) {
        console.error("Stripe checkout error:", error);
        throw new Error(error.message || "Failed to create payment session");
      }
      
      if (data?.url) {
        toast.info("Redirecting to Stripe checkout...");
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Error creating Stripe checkout:", error);
      toast.error(error.message || "Failed to create payment session. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCoinPaymentsPayment = async (amount: number, currency: string = 'USDT') => {
    if (!validatePaymentRequest(amount)) return;
    
    setIsProcessing(true);
    
    try {
      console.log(`Creating CoinPayments payment with currency: ${currency}`);
      
      const { data, error } = await supabase.functions.invoke('create-coinpayments-payment', {
        body: { amount, walletAddress, currency }
      });
      
      if (error) {
        console.error("CoinPayments error:", error);
        throw new Error(error.message || "Failed to create CoinPayments transaction");
      }
      
      if (!data) {
        throw new Error("No payment data received");
      }
      
      setCryptoPaymentDetails({
        paymentAddress: data.paymentAddress,
        transactionId: data.transactionId,
        instructions: data.instructions,
        qrCodeUrl: data.qrCodeUrl,
        statusUrl: data.statusUrl,
        expiresAt: data.expiresAt,
        externalTransactionId: data.externalTransactionId,
        currency: data.currency || currency
      });
      
      setShowCryptoDialog(true);
      toast.success("CoinPayments transaction created");
    } catch (error: any) {
      console.error("Error creating CoinPayments transaction:", error);
      toast.error(error.message || "Failed to create CoinPayments transaction. Please try again.");
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
    handleCoinPaymentsPayment
  };
};
