
import { useState } from 'react';
import { toast } from 'sonner';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { PaymentValidationOptions } from './types';

export const usePaymentValidation = (walletAddress: string | null) => {
  const { kycData } = useKycVerification();
  
  const validatePaymentRequest = (amount: number, options: PaymentValidationOptions = {}): boolean => {
    const { isCrypto = false } = options;
    
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
  
  const kycRequired = (amount: number): boolean => amount >= 3001;
  
  return {
    validatePaymentRequest,
    kycRequired,
    kycData
  };
};
