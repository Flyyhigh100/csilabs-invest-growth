
import { useState } from 'react';
import { toast } from 'sonner';
import { CryptoPaymentDetails } from './types';
import { usePaymentValidation } from './usePaymentValidation';
import { useCryptoStatusCheck } from './crypto/useCryptoStatusCheck';
import { 
  createCoinPaymentsTransaction, 
  createCryptoTransaction,
  checkPaymentStatus 
} from './crypto';

export const useCryptoPayments = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<CryptoPaymentDetails>(null);
  const { validatePaymentRequest } = usePaymentValidation(walletAddress);
  const { checkTransactionStatus } = useCryptoStatusCheck();

  /**
   * Validate wallet address availability
   */
  const validateWalletAddress = () => {
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
    return true;
  };

  /**
   * Handle payment with CoinPayments (multiple cryptocurrencies)
   */
  const handleCoinPaymentsPayment = async (amount: number, currency: string = 'USDT') => {
    // Pass true for isCrypto to validate KYC if needed
    if (!validatePaymentRequest(amount, { isCrypto: true }) || !validateWalletAddress()) {
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      const paymentDetails = await createCoinPaymentsTransaction({
        amount,
        walletAddress,
        currency
      });
      
      if (paymentDetails) {
        setCryptoPaymentDetails(paymentDetails);
        
        toast.success(`${currency} Payment Ready`, {
          description: "Follow the payment instructions to complete your purchase.",
          duration: 5000,
        });
        
        return true;
      }
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Handle direct crypto payment (currently USDC)
   */
  const handleCryptoPayment = async (amount: number) => {
    // Pass true for isCrypto to validate KYC if needed
    if (!validatePaymentRequest(amount, { isCrypto: true }) || !validateWalletAddress()) {
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      const paymentDetails = await createCryptoTransaction({
        amount,
        walletAddress
      });
      
      if (paymentDetails) {
        setCryptoPaymentDetails(paymentDetails);
        
        toast.success("USDC Payment Ready", {
          description: "Follow the payment instructions to complete your purchase.",
          duration: 5000,
        });
        
        return true;
      }
      
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
    setIsProcessing,
    checkPaymentStatus: (transactionId: string) => checkPaymentStatus(transactionId, checkTransactionStatus)
  };
};
