
import { useState } from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import { toast } from 'sonner';
import { PaymentValidationOptions } from './types';

export const usePaymentValidation = (walletAddress: string | null) => {
  const [kycRequired, setKycRequired] = useState<boolean>(false);

  // Check if KYC is required based on amount (now $10,000)
  const requiresKyc = (amount: number): boolean => {
    return amount >= 10000;
  };

  // Validate if a payment request can proceed
  const validatePaymentRequest = (
    amount: number, 
    options: PaymentValidationOptions = {}
  ): boolean => {
    const { isCrypto = false, skipKycCheck = false, tokenPrice = 1 } = options;
    
    // Validate amount
    if (!amount || amount <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount to continue.",
        duration: 5000,
      });
      return false;
    }

    // Check maximum purchase limit (10,000 tokens)
    const tokenAmount = tokenPrice ? amount / tokenPrice : amount;
    if (tokenAmount > 10000) {
      toast.error("Maximum Purchase Limit Exceeded", {
        description: "Maximum purchase limit is 10,000 tokens per transaction.",
        duration: 5000,
      });
      return false;
    }
    
    // Check if wallet address is required for crypto payments
    if (isCrypto && !walletAddress) {
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
    
    // Check if KYC is required for this amount (if not skipped)
    if (!skipKycCheck) {
      const needsKyc = requiresKyc(amount);
      setKycRequired(needsKyc);
    }
    
    return true;
  };

  return {
    validatePaymentRequest,
    kycRequired: requiresKyc,
    isKycRequired: kycRequired
  };
};
