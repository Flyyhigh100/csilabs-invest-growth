
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CryptoPaymentDetails } from './types';
import { usePaymentValidation } from './usePaymentValidation';
import { useCryptoStatusCheck } from './useCryptoStatusCheck';
import { convertUsdToCrypto } from './crypto/currencyConverter';

export const useCryptoPayments = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<CryptoPaymentDetails>(null);
  const { validatePaymentRequest } = usePaymentValidation(walletAddress);
  const { checkTransactionStatus } = useCryptoStatusCheck();

  const handleCoinPaymentsPayment = async (amount: number, currency: string = 'USDT') => {
    // Pass true for isCrypto to validate KYC if needed
    if (!validatePaymentRequest(amount, { isCrypto: true })) return false;
    
    // Extra validation check for wallet address
    if (!walletAddress) {
      toast.error("Wallet Address Required", {
        description: "You need to provide a wallet address to receive your tokens after purchase.",
        duration: 5000,
      });
      
      // Scroll to wallet section
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
      toast.info(`Creating ${currency} payment...`, {
        id: "crypto-preparing",
        description: `Preparing ${currency} payment session.`,
      });
      
      // Convert USD amount to crypto amount first
      console.log(`Converting $${amount} to ${currency}...`);
      const cryptoAmount = await convertUsdToCrypto(amount, currency);
      console.log(`Conversion result: ${cryptoAmount} ${currency}`);
      
      console.log(`Creating CoinPayments payment with currency: ${currency}, amount: ${cryptoAmount} ${currency} (${amount} USD)`);
      
      const { data, error } = await supabase.functions.invoke('create-coinpayments-payment', {
        body: { 
          amount: amount,  // We still send the USD amount 
          walletAddress, 
          currency,
          cryptoAmount: cryptoAmount // Add the converted amount
        }
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
        checkStatusUrl: data.checkStatusUrl,
        cryptoAmount: data.cryptoAmount || cryptoAmount // Store the crypto amount
      });
      
      toast.success(`${currency} Payment Ready`, {
        description: "Follow the payment instructions to complete your purchase.",
        duration: 5000,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error creating CoinPayments transaction:", error);
      toast.error("Crypto payment failed", {
        description: error.message || "Unable to create payment request. Please try again.",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCryptoPayment = async (amount: number) => {
    // Pass true for isCrypto to validate KYC if needed
    if (!validatePaymentRequest(amount, { isCrypto: true })) return false;
    
    // Double check wallet address
    if (!walletAddress) {
      toast.error("Wallet Address Required", {
        description: "You need to provide a wallet address to receive your tokens after purchase.",
        duration: 5000,
      });
      
      // Scroll to wallet section
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
      
      toast.success("USDC Payment Ready", {
        description: "Follow the payment instructions to complete your purchase.",
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

  // Check status of a payment by transaction ID in Supabase
  const checkPaymentStatus = async (transactionId: string) => {
    try {
      // Get the transaction from Supabase
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();
        
      if (error || !transaction) {
        console.error("Error fetching transaction:", error);
        return false;
      }
      
      // Use the checkTransactionStatus function from useCryptoStatusCheck
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
