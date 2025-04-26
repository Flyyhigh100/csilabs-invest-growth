
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
          tokenPrice: currentTokenPrice // Pass the current token price to the payment function
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
      
      // Create payment details with properly formatted data
      setCryptoPaymentDetails({
        paymentAddress: data.paymentAddress, // This should now be a clean address
        transactionId: data.transactionId,
        instructions: `Please send ${data.amount} ${data.currency || currency} to the address above to complete your purchase of $${amount} worth of CSi tokens.`,
        qrCodeUrl: data.qrCodeUrl,
        statusUrl: data.statusUrl,
        expiresAt: data.expiresAt,
        externalTransactionId: data.externalTransactionId,
        currency: data.currency || currency,
        checkStatusUrl: data.checkStatusUrl,
        // Store original USD value for reference
        usdValue: amount,
        // Store token amount and price for reference
        tokenAmount: data.tokenAmount,
        tokenPrice: data.tokenPrice || currentTokenPrice,
        // Add the actual crypto amount from the API response
        amount: data.amount
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
  
  const handleCryptoPayment = async (amount: number, currentTokenPrice?: number) => {
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
        body: { 
          amount, 
          walletAddress,
          tokenPrice: currentTokenPrice // Pass the current token price
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

