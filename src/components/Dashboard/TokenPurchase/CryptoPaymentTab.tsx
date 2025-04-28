
import React, { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAvailableCurrencies } from '@/hooks/payments/useAvailableCurrencies';
import { KycVerificationData } from '@/hooks/kyc/types';
import PaymentHeader from './components/PaymentHeader';
import CurrencySelector from './components/CurrencySelector';
import PaymentSummary from './components/PaymentSummary';
import PaymentStatus from './components/PaymentStatus';

interface CryptoPaymentTabProps {
  amount: number;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  handleCoinPaymentWithCurrency: () => void;
  isProcessing: boolean;
  isKycNeeded: boolean;
  isWalletMissing: boolean;
  kycData?: KycVerificationData | null;
}

const CryptoPaymentTab: React.FC<CryptoPaymentTabProps> = ({
  amount,
  selectedCurrency,
  setSelectedCurrency,
  handleCoinPaymentWithCurrency,
  isProcessing,
  isKycNeeded,
  isWalletMissing,
  kycData
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { currencies, isLoading, error, refreshCurrencies } = useAvailableCurrencies();
  
  const hasCurrencies = currencies && Object.keys(currencies).length > 0;
  const isFallbackMode = currencies && currencies.USDT && currencies.USDT.fallbackMode === true;
  
  const handleRefreshClick = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    toast.info("Refreshing available currencies...");
    
    try {
      await refreshCurrencies();
      toast.success("Available currencies updated");
    } catch (refreshError) {
      toast.error("Failed to refresh currencies", {
        description: "Please try again later."
      });
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 3000);
    }
  };

  const handlePaymentClick = () => {
    if (isWalletMissing) {
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
      
      return;
    }
    
    if (isKycNeeded) {
      toast.error("KYC Verification Required", {
        description: "For purchases over $10,000, you need to complete KYC verification first.",
        duration: 5000,
      });
      return;
    }
    
    handleCoinPaymentWithCurrency();
  };

  return (
    <div className="space-y-4">
      <PaymentHeader />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load payment options. Please try again later or contact support.
          </AlertDescription>
        </Alert>
      )}
      
      {isFallbackMode && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Using limited currency options due to connection issues with the payment provider.
          </AlertDescription>
        </Alert>
      )}
      
      <CurrencySelector 
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        currencies={currencies}
        isLoading={isLoading}
        isProcessing={isProcessing}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshClick}
      />
      
      <PaymentSummary 
        amount={amount}
        isProcessing={isProcessing}
        isLoading={isLoading}
        hasCurrencies={hasCurrencies}
        selectedCurrency={selectedCurrency}
        onPaymentClick={handlePaymentClick}
      />
      
      <PaymentStatus 
        amount={amount}
        kycData={kycData}
      />
    </div>
  );
};

export default CryptoPaymentTab;
