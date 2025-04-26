
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CryptoPaymentDetails } from '../types';

export const usePaymentCreation = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<CryptoPaymentDetails>(null);

  const formatPaymentDetails = (data: any, amount: number, currency: string, currentTokenPrice?: number) => {
    // Calculate expiration time properly
    const expiresAt = new Date(Date.now() + (data.timeout * 1000)).toISOString();
    
    return {
      paymentAddress: data.address,
      transactionId: data.txn_id,
      instructions: `Please send ${data.amount} ${data.currency || currency} to the address above.`,
      qrCodeUrl: data.qrcode_url,
      statusUrl: data.status_url,
      expiresAt,
      externalTransactionId: data.txn_id,
      currency: data.currency || currency,
      checkStatusUrl: `/dashboard/transactions?payment=crypto&txn=${data.txn_id}`,
      usdValue: amount,
      tokenAmount: data.tokenAmount,
      tokenPrice: data.tokenPrice || currentTokenPrice,
      amount: data.amount
    };
  };

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
