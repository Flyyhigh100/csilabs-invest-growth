
import { useState } from 'react';
import { CryptoPaymentDetails } from '../types';
import { toast } from 'sonner';

/**
 * Hook for managing crypto payment creation state
 */
export const usePaymentCreation = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<CryptoPaymentDetails | null>(null);

  /**
   * Validate the wallet address is present
   */
  const validateWalletAddress = (): boolean => {
    if (!walletAddress) {
      console.error("Wallet address is required");
      toast.error("Missing wallet address", {
        description: "Please add a wallet address in your profile first."
      });
      return false;
    }
    return true;
  };
  
  /**
   * Format payment details from API response for UI display
   */
  const formatPaymentDetails = (
    data: any, 
    usdAmount: number, 
    currency: string = 'USDT',
    tokenPrice?: number
  ): CryptoPaymentDetails => {
    console.log("Formatting payment details from data:", data);
    
    // Handle common payment data fields
    const commonDetails: CryptoPaymentDetails = {
      payment_id: data.transactionId || data.payment_id || "",
      paymentAddress: data.paymentAddress || data.address || "",
      payment_address: data.paymentAddress || data.address || "",
      qrCodeUrl: data.qrCodeUrl || data.qrcode_url || "",
      qrcode_url: data.qrCodeUrl || data.qrcode_url || "",
      statusUrl: data.statusUrl || data.status_url || "",
      status_url: data.statusUrl || data.status_url || "",
      txn_id: data.externalTransactionId || data.txn_id || "",
      externalTransactionId: data.externalTransactionId || data.txn_id || "",
      currency: currency || data.currency || "USDT",
      amount: data.amount || data.amountf || "",
      usdValue: usdAmount,
      checkStatusUrl: data.checkStatusUrl || `/dashboard/transactions?payment=crypto&txn=${data.transactionId || data.payment_id || ""}`,
      tokenAmount: data.tokenAmount || (tokenPrice ? usdAmount / tokenPrice : usdAmount),
      tokenPrice: tokenPrice,
      transactionId: data.transactionId || data.payment_id || "",
    };
    
    // Handle expiration time - convert from seconds if needed
    if (data.timeout && !data.expiresAt) {
      // Convert seconds to ISO date string if it's a number of seconds
      const expiryTime = new Date(Date.now() + (parseInt(data.timeout) * 1000));
      commonDetails.expiresAt = expiryTime.toISOString();
    } else if (data.expiresAt) {
      commonDetails.expiresAt = data.expiresAt;
    }
    
    // Add instructions based on currency
    // Template for instructions (adapt based on cryptocurrency)
    commonDetails.instructions = `Please send exactly ${commonDetails.amount} ${commonDetails.currency} to the address above. The payment will be processed automatically once confirmed on the blockchain.`;
    
    return commonDetails;
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
