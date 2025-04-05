
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';

type CryptoPaymentDetails = {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
  currency?: string;
  checkStatusUrl?: string;
} | null;

export const usePaymentHandlers = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCryptoDialog, setShowCryptoDialog] = useState(false);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<CryptoPaymentDetails>(null);
  const { kycData } = useKycVerification();

  const validatePaymentRequest = (amount: number, isCrypto: boolean = false): boolean => {
    // Validate wallet address
    if (!walletAddress) {
      toast.error("Please add a wallet address before proceeding with payment", {
        description: "Your tokens will be sent to this address after purchase."
      });
      return false;
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount", {
        description: "The amount must be greater than zero."
      });
      return false;
    }

    // Check KYC verification for high-value crypto payments
    if (isCrypto && amount >= 3001) {
      // Check if KYC is approved
      if (kycData?.status !== 'approved') {
        toast.error("KYC verification required", {
          description: "Crypto payments of $3,001 or more require KYC verification. Please complete verification first."
        });
        return false;
      }
    }
    
    return true;
  };

  const handleStripePayment = async (amount: number) => {
    if (!validatePaymentRequest(amount)) return;
    
    setIsProcessing(true);
    
    try {
      toast.info("Preparing payment session...", {
        id: "stripe-preparing"
      });
      
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { amount, walletAddress }
      });
      
      if (error) {
        console.error("Stripe checkout error:", error);
        toast.dismiss("stripe-preparing");
        throw new Error(error.message || "Failed to create payment session");
      }
      
      if (data?.url) {
        toast.dismiss("stripe-preparing");
        toast.info("Redirecting to Stripe checkout...", {
          description: "You will be redirected to complete your payment securely."
        });
        
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.dismiss("stripe-preparing");
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Error creating Stripe checkout:", error);
      toast.error("Payment session failed", {
        description: error.message || "Please try again or contact support."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCoinPaymentsPayment = async (amount: number, currency: string = 'USDT') => {
    // Pass true for isCrypto to validate KYC if needed
    if (!validatePaymentRequest(amount, true)) return;
    
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
      
      setShowCryptoDialog(true);
      toast.success("Payment instructions ready", {
        description: `Please follow the instructions to complete your ${currency} payment.`
      });
    } catch (error: any) {
      console.error("Error creating CoinPayments transaction:", error);
      toast.error("Crypto payment failed", {
        description: error.message || "Unable to create payment request. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCryptoPayment = async (amount: number) => {
    // Pass true for isCrypto to validate KYC if needed
    if (!validatePaymentRequest(amount, true)) return;
    
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
      
      setShowCryptoDialog(true);
      toast.success("Payment instructions ready", {
        description: "Please follow the instructions to complete your USDC payment."
      });
    } catch (error: any) {
      console.error("Error creating crypto payment:", error);
      toast.error("Crypto payment failed", {
        description: error.message || "Unable to create payment request. Please try again."
      });
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
    handleCoinPaymentsPayment,
    handleCryptoPayment,
    kycRequired: (amount: number) => amount >= 3001
  };
};
