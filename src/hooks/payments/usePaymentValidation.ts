
import { useState } from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import { toast } from 'sonner';
import { PaymentValidationOptions } from './types';

export const usePaymentValidation = (walletAddress: string | null) => {
  const [kycRequired, setKycRequired] = useState<boolean>(false);

  // Check if KYC is required based on amount
  const requiresKyc = (amount: number): boolean => {
    // Logic to determine if KYC is required based on amount
    return amount >= 3001;
  };

  // Validate if a payment request can proceed
  const validatePaymentRequest = (
    amount: number, 
    options: PaymentValidationOptions = {}
  ): boolean => {
    const { isCrypto = false, skipKycCheck = false } = options;
    
    // Validate amount
    if (!amount || amount <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount to continue.",
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
      
      // This is commented out for now as we're allowing payments without KYC in test mode
      // But the logic is kept here for future implementation
      /*
      if (needsKyc && kycData?.status !== 'approved') {
        toast.error("KYC Required", {
          description: "For purchases over $3,000, you need to complete KYC verification first.",
          duration: 5000,
        });
        return false;
      }
      */
    }
    
    return true;
  };

  return {
    validatePaymentRequest,
    kycRequired: requiresKyc, // Export the function directly instead of the state
    isKycRequired: kycRequired // Keep the state as well under a different name if needed
  };
};
