
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CryptoPaymentDetails } from './types';
import { usePaymentValidation } from './usePaymentValidation';

export const useCryptoPayments = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<CryptoPaymentDetails>(null);
  const { validatePaymentRequest } = usePaymentValidation(walletAddress);

  const handleCoinPaymentsPayment = async (amount: number, currency: string = 'USDT') => {
    // Pass true for isCrypto to validate KYC if needed
    if (!validatePaymentRequest(amount, { isCrypto: true })) return;
    
    setIsProcessing(true);
    
    try {
      toast.info("Creating crypto payment...", {
        id: "crypto-preparing",
        description: `Preparing ${currency} payment session.`
      });
      
      console.log(`Creating CoinPayments payment with currency: ${currency}`);
      
      const { data, error } = await supabase.functions.invoke('create-coinpayments-payment', {
        body: { amount, walletAddress, currency }
      });
      
      toast.dismiss("crypto-preparing");
      
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
        currency: data.currency || currency,
        checkStatusUrl: data.checkStatusUrl
      });
      
      return true;
    } catch (error: any) {
      console.error("Error creating CoinPayments transaction:", error);
      toast.error("Crypto payment failed", {
        description: error.message || "Unable to create payment request. Please try again."
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCryptoPayment = async (amount: number) => {
    // Pass true for isCrypto to validate KYC if needed
    if (!validatePaymentRequest(amount, { isCrypto: true })) return;
    
    setIsProcessing(true);
    
    try {
      toast.info("Creating crypto payment...", {
        id: "direct-crypto-preparing"
      });
      
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { amount, walletAddress }
      });
      
      toast.dismiss("direct-crypto-preparing");
      
      if (error) {
        console.error("Crypto payment error:", error);
        throw new Error(error.message || "Failed to create crypto payment");
      }
      
      if (!data) {
        throw new Error("No payment data received");
      }
      
      setCryptoPaymentDetails({
        paymentAddress: data.paymentAddress,
        transactionId: data.transactionId,
        instructions: data.instructions,
        currency: 'USDC',
        checkStatusUrl: data.checkStatusUrl
      });
      
      return true;
    } catch (error: any) {
      console.error("Error creating crypto payment:", error);
      toast.error("Crypto payment failed", {
        description: error.message || "Unable to create payment request. Please try again."
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleCoinPaymentsPayment,
    handleCryptoPayment,
    cryptoPaymentDetails,
    setCryptoPaymentDetails,
    isProcessing,
    setIsProcessing
  };
};
