import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CryptoPaymentDetails } from './types';
import { usePaymentValidation } from './usePaymentValidation';
import { useCryptoStatusCheck } from './useCryptoStatusCheck';

export const useCryptoPayments = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<CryptoPaymentDetails>(null);
  const { validatePaymentRequest } = usePaymentValidation(walletAddress);
  const { checkTransactionStatus } = useCryptoStatusCheck();

  const handleCoinPaymentsPayment = async (amount: number, currency: string = 'USDT', currentTokenPrice?: number) => {
    if (!validatePaymentRequest(amount, { isCrypto: true })) return false;
    
    if (!walletAddress) {
      toast.error("Wallet Address Required", {
        description: "You need to provide a wallet address to receive your tokens after purchase.",
        duration: 5000,
      });
      
      setTimeout(() => {
        document.getElementById('wallet-address-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
      
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      toast.info("Creating crypto payment...", {
        id: "crypto-preparing",
        description: `Preparing ${currency} payment session.`,
      });
      
      console.log(`Creating CoinPayments payment with currency: ${currency}`);
      console.log(`Current token price: ${currentTokenPrice || 'not provided'}`);
      
      const { data, error } = await supabase.functions.invoke('create-coinpayments-payment', {
        body: { 
          amount, 
          walletAddress, 
          currency,
          tokenPrice: currentTokenPrice
        }
      });
      
      toast.dismiss("crypto-preparing");
      
      if (error) {
        console.error("CoinPayments error:", error);
        throw new Error(error.message || "Failed to create CoinPayments transaction");
      }
      
      if (!data || !data.success) {
        throw new Error(data?.message || "No payment data received");
      }

      setCryptoPaymentDetails({
        paymentAddress: data.paymentAddress,
        transactionId: data.transactionId,
        instructions: `Please send ${data.amount} ${data.currency || currency} to the address above.`,
        qrCodeUrl: data.qrCodeUrl,
        statusUrl: data.statusUrl,
        expiresAt: data.expiresAt,
        externalTransactionId: data.externalTransactionId,
        currency: data.currency || currency,
        checkStatusUrl: data.checkStatusUrl,
        usdValue: amount,
        tokenAmount: data.tokenAmount,
        tokenPrice: data.tokenPrice || currentTokenPrice,
        amount: data.amount
      });
      
      toast.success(`${currency} Payment Ready`, {
        description: "Follow the payment instructions to complete your purchase.",
        duration: 5000,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error creating CoinPayments transaction:", error);
      toast.error("Payment creation failed", {
        description: error.message || "Unable to create payment. Please try again.",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoPayment = async (amount: number, currentTokenPrice?: number) => {
    if (!validatePaymentRequest(amount, { isCrypto: true })) return false;
    
    if (!walletAddress) {
      toast.error("Wallet Address Required", {
        description: "You need to provide a wallet address to receive your tokens after purchase.",
        duration: 5000,
      });
      
      setTimeout(() => {
        document.getElementById('wallet-address-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
      
      return false;
    }
    
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
        checkStatusUrl: data.checkStatusUrl,
        usdValue: amount,
        tokenAmount: data.tokenAmount,
        tokenPrice: data.tokenPrice || currentTokenPrice
      });
      
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

  const checkPaymentStatus = async (transactionId: string) => {
    try {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();
        
      if (error || !transaction) {
        console.error("Error fetching transaction:", error);
        return false;
      }
      
      return await checkTransactionStatus(transaction);
    } catch (err) {
      console.error("Error checking payment status:", err);
      return false;
    }
  };

  return {
    handleCoinPaymentsPayment,
    handleCryptoPayment,
    cryptoPaymentDetails,
    setCryptoPaymentDetails,
    isProcessing,
    setIsProcessing,
    checkPaymentStatus
  };
};
