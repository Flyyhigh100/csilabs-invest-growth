
import { useState } from 'react';
import { toast } from 'sonner';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { PaymentValidationOptions } from './types';

export const usePaymentValidation = (walletAddress: string | null) => {
  const { kycData } = useKycVerification();
  
  const validatePaymentRequest = (amount: number, options: PaymentValidationOptions = { isCrypto: false }): boolean => {
    const { isCrypto = false } = options;
    
    // Validate wallet address
    if (!walletAddress) {
      toast.error("Wallet Address Required", {
        description: "You must add a wallet address before proceeding with payment. Your tokens will be sent to this address after purchase.",
        duration: 5000,
      });
      
      // Scroll to wallet address section for better UX
      setTimeout(() => {
        document.getElementById('wallet-address-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
      
      return false;
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount greater than zero.",
        duration: 3000,
      });
      return false;
    }

    // Check KYC verification for high-value crypto payments
    if (isCrypto && amount >= 3001) {
      // Check if KYC is approved
      if (kycData?.status !== 'approved') {
        toast.error("KYC Verification Required", {
          description: "Crypto payments of $3,001 or more require KYC verification. Please complete verification first.",
          duration: 5000,
        });
        return false;
      }
    }
    
    return true;
  };
  
  const kycRequired = (amount: number): boolean => amount >= 3001;
  
  return {
    validatePaymentRequest,
    kycRequired,
    kycData
  };
};
