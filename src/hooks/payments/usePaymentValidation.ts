
import { useState } from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import { toast } from 'sonner';
import { PaymentValidationOptions } from './types';

export const usePaymentValidation = (walletAddress: string | null) => {
  const [kycRequired, setKycRequired] = useState<boolean>(false);

  // Check if KYC is required based on amount ($10,000)
  const requiresKyc = (amount: number): boolean => {
    return amount >= 10000;
  };

  // Validate if a payment request can proceed
  const validatePaymentRequest = (
    amount: number, 
    options: PaymentValidationOptions = {}
  ): boolean => {
    const { isCrypto = false, skipKycCheck = false, tokenPrice = 1 } = options;
    
    // Validate amount is present
    if (!amount || amount <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount to continue.",
        duration: 5000,
      });
      return false;
    }

    // Calculate token amount based on current price
    const tokenAmount = tokenPrice ? amount / tokenPrice : amount;
    console.log('Validating payment:', { 
      amount, 
      tokenAmount, 
      tokenPrice, 
      isCrypto 
    });

    // Check maximum token limit (10,000 tokens) regardless of payment method
    if (tokenAmount > 10000) {
      toast.error("Maximum Token Limit Exceeded", {
        description: `Maximum purchase limit is 10,000 tokens per transaction (current calculation: ${tokenAmount.toFixed(2)} tokens).`,
        duration: 5000,
      });
      return false;
    }
    
    // Check if wallet address is required for crypto payments
    if (isCrypto && !walletAddress) {
      toast.error("Wallet Address Required", {
        description: "Please add a wallet address to receive your tokens after purchase.",
        duration: 5000,
      });
      document.getElementById('wallet-address-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      return false;
    }
    
    // Check if KYC is required for crypto payments over $10,000
    if (isCrypto && !skipKycCheck && requiresKyc(amount)) {
      console.log('KYC required for crypto payment amount:', amount);
      setKycRequired(true);
      toast.error("KYC Required", {
        description: "KYC verification is required for crypto payments of $10,000 or more.",
        duration: 5000,
      });
      return false;
    }
    
    setKycRequired(false);
    return true;
  };

  return {
    validatePaymentRequest,
    kycRequired: requiresKyc,
    isKycRequired: kycRequired
  };
};
