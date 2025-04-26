
import { useCoinPaymentsTransaction } from './crypto/useCoinPaymentsTransaction';
import { useCryptoStatusCheck } from './crypto/useCryptoStatusCheck';
import { useDirectCryptoPayment } from './crypto/useDirectCryptoPayment';

export const useCryptoPayments = (walletAddress: string | null) => {
  const { 
    handleCoinPaymentsPayment,
    cryptoPaymentDetails,
    isProcessing: isCoinPaymentsProcessing
  } = useCoinPaymentsTransaction(walletAddress);

  const {
    handleDirectCryptoPayment,
    isProcessing: isDirectCryptoProcessing
  } = useDirectCryptoPayment(walletAddress);

  const { checkTransactionStatus } = useCryptoStatusCheck();

  return {
    handleCoinPaymentsPayment,
    handleCryptoPayment: handleDirectCryptoPayment,
    cryptoPaymentDetails,
    setCryptoPaymentDetails: () => {}, // Maintained for backward compatibility
    isProcessing: isCoinPaymentsProcessing || isDirectCryptoProcessing,
    setIsProcessing: () => {}, // Maintained for backward compatibility
    checkTransactionStatus
  };
};
