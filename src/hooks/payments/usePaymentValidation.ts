
import { toast } from 'sonner';
import { PaymentValidationOptions } from './types';

export const usePaymentValidation = (walletAddress: string | null) => {
  /**
   * Validate payment request based on amount, KYC status, etc.
   */
  const validatePaymentRequest = (
    amount: number, 
    options: PaymentValidationOptions = {}
  ): boolean => {
    // Check for wallet address
    if (!walletAddress) {
      toast.error("Wallet address required", {
        description: "Please add a wallet address to your profile first."
      });
      return false;
    }
    
    // Check for valid amount
    if (!amount || amount <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid amount greater than 0."
      });
      return false;
    }
    
    return true;
  };
  
  /**
   * Check if KYC is required for a given purchase amount
   */
  const kycRequired = (amount: number): boolean => {
    // For crypto purchases over $10k, KYC is required
    return amount >= 10000;
  };
  
  return {
    validatePaymentRequest,
    kycRequired
  };
};
