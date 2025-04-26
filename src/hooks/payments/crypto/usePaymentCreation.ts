
import { useState } from 'react';
import { toast } from 'sonner';
import { CryptoPaymentDetails } from '../types';

/**
 * Hook that provides common functionality for creating crypto payments
 */
export const usePaymentCreation = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<CryptoPaymentDetails | null>(null);

  /**
   * Format raw payment API data into a standardized format
   */
  const formatPaymentDetails = (data: any, amount: number, currency: string, currentTokenPrice?: number) => {
    console.log("Formatting payment details from:", data);
    
    // Format expiration time properly
    let expiresAt: string;
    
    try {
      // Check if timeout is a number of seconds
      if (typeof data.timeout === 'number') {
        expiresAt = new Date(Date.now() + (data.timeout * 1000)).toISOString();
        console.log(`Calculated expiration from timeout (${data.timeout}s):`, expiresAt);
      }
      // Check if it's already an ISO string
      else if (typeof data.timeout === 'string' && data.timeout.match(/^\d{4}-\d{2}-\d{2}T/)) {
        expiresAt = data.timeout;
        console.log(`Using provided ISO expiration:`, expiresAt);
      }
      // Default to 1 hour from now if invalid or missing
      else {
        console.warn('Invalid timeout format received:', data.timeout);
        expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
        console.log(`Using default 1-hour expiration:`, expiresAt);
      }
    } catch (error) {
      console.error('Error formatting expiration time:', error);
      // Fallback to 1 hour from now
      expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
      console.log(`Fallback to default 1-hour expiration:`, expiresAt);
    }
    
    const formattedData = {
      paymentAddress: data.paymentAddress || data.address,
      transactionId: data.transactionId || data.txn_id,
      instructions: data.instructions || `Please send ${data.amount || ''} ${data.currency || currency} to the address above.`,
      qrCodeUrl: data.qrCodeUrl || data.qrcode_url,
      statusUrl: data.statusUrl || data.status_url,
      expiresAt,
      externalTransactionId: data.externalTransactionId || data.txn_id,
      currency: data.currency || currency,
      checkStatusUrl: data.checkStatusUrl || `/dashboard/transactions?payment=crypto&txn=${data.txn_id || data.transactionId}`,
      usdValue: amount,
      tokenAmount: data.tokenAmount,
      tokenPrice: data.tokenPrice || currentTokenPrice,
      amount: data.amount
    };
    
    console.log("Formatted payment details:", formattedData);
    return formattedData;
  };

  /**
   * Validate that a wallet address is provided
   */
  const validateWalletAddress = () => {
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
    return true;
  };

  return {
    isProcessing,
    setIsProcessing,
    cryptoPaymentDetails,
    setCryptoPaymentDetails,
    formatPaymentDetails,
    validateWalletAddress
  };
};
