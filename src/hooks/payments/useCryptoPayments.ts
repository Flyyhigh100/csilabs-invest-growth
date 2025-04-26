
import { useState } from 'react';
import { useCoinPaymentsTransaction } from './crypto/useCoinPaymentsTransaction';
import { useCryptoStatusCheck } from './crypto/useCryptoStatusCheck';
import { useDirectCryptoPayment } from './crypto/useDirectCryptoPayment';
import { CryptoPaymentDetails } from './types';

/**
 * Hook that provides comprehensive crypto payment functionality
 * by combining specific payment method hooks
 */
export const useCryptoPayments = (walletAddress: string | null) => {
  // Get CoinPayments transaction functionality
  const { 
    handleCoinPaymentsPayment,
    cryptoPaymentDetails,
    isProcessing: isCoinPaymentsProcessing
  } = useCoinPaymentsTransaction(walletAddress);

  // Get direct crypto payment functionality
  const {
    handleDirectCryptoPayment,
    isProcessing: isDirectCryptoProcessing
  } = useDirectCryptoPayment(walletAddress);

  // Get status check functionality
  const { checkTransactionStatus } = useCryptoStatusCheck();

  return {
    // CoinPayments functionality
    handleCoinPaymentsPayment,
    cryptoPaymentDetails,
    
    // Direct crypto payment functionality
    handleCryptoPayment: handleDirectCryptoPayment,
    
    // Backward compatibility - these are maintained for API compatibility
    setCryptoPaymentDetails: () => {}, 
    setIsProcessing: () => {}, 
    
    // Combined processing state
    isProcessing: isCoinPaymentsProcessing || isDirectCryptoProcessing,
    
    // Transaction status checking
    checkTransactionStatus
  };
};
