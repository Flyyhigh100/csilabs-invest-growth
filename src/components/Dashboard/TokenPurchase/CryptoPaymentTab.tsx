
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, AlertTriangle, CheckCircle, Info, RefreshCw, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KycVerificationData } from '@/hooks/kyc/types';
import { toast } from 'sonner';
import { useAvailableCurrencies } from '@/hooks/payments/useAvailableCurrencies';
import { Spinner } from "@/components/ui/spinner";
import { validateCryptoAmount } from '@/hooks/payments/crypto/validationUtils';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  
  // Handle refresh with a debounce mechanism to prevent API abuse
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
      // Prevent multiple rapid refreshes
      setTimeout(() => {
        setIsRefreshing(false);
      }, 3000);
    }
  };
  
  // Update selected currency when currencies change
  React.useEffect(() => {
    if (!isLoading && hasCurrencies) {
      const currencyCodes = Object.keys(currencies);
      
      // Always prefer USDT if available
      if (currencyCodes.includes('USDT')) {
        setSelectedCurrency('USDT');
      } else if (!currencyCodes.includes(selectedCurrency) && currencyCodes.length > 0) {
        // Fallback to first currency if current selection is unavailable
        setSelectedCurrency(currencyCodes[0]);
      }
    }
  }, [currencies, selectedCurrency, setSelectedCurrency, isLoading, hasCurrencies]);

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
        description: "For purchases over $3,000, you need to complete KYC verification first.",
        duration: 5000,
      });
      return;
    }

    const validation = validateCryptoAmount(amount, selectedCurrency);
    if (!validation.isValid) {
      toast.error("Amount Too Low", {
        description: validation.message,
        duration: 5000,
      });
      return;
    }
    
    handleCoinPaymentWithCurrency();
  };

  const renderCurrencyOptions = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Spinner className="h-4 w-4 mr-2" />
          <span>Loading available currencies...</span>
        </div>
      );
    } 
    
    if (!hasCurrencies) {
      return (
        <div className="p-4 text-red-500 text-center">
          {error || "No currencies available"}
        </div>
      );
    }
    
    return Object.entries(currencies).map(([code, data]) => (
      <SelectItem 
        key={code} 
        value={code} 
        className="hover:bg-blue-50"
      >
        {data.name || code}
      </SelectItem>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-white p-2 rounded-full border border-gray-200">
          <Wallet className="h-6 w-6 text-cbis-blue" />
        </div>
        <div>
          <h4 className="font-medium text-gray-800">Cryptocurrency Payment</h4>
          <p className="text-sm text-gray-600 mt-1">
            Pay with your preferred cryptocurrency. KYC required for amounts $3,001 or more.
          </p>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
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
      
      {isWalletMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex gap-2 items-center">
            <Info className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Please add a wallet address in Step 1 before proceeding with crypto payment.
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="crypto-currency" className="text-sm text-gray-700 font-medium">Select Cryptocurrency</Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshClick} 
            disabled={isLoading || isProcessing || isRefreshing}
            className="text-xs flex items-center gap-1"
          >
            {(isLoading || isRefreshing) ? <Spinner className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
            Refresh
          </Button>
        </div>
        
        <Select 
          value={selectedCurrency} 
          onValueChange={setSelectedCurrency} 
          disabled={isProcessing || isLoading || !hasCurrencies}
        >
          <SelectTrigger 
            id="crypto-currency" 
            className="mt-2 border border-gray-200 bg-white focus:ring-2 focus:ring-cbis-blue focus:border-cbis-blue transition-all"
          >
            <SelectValue placeholder={isLoading ? "Loading currencies..." : "Select cryptocurrency"} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            {renderCurrencyOptions()}
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">Total amount:</p>
          <p className="text-lg font-medium text-gray-800">${amount.toLocaleString()}</p>
        </div>
        <Button 
          onClick={handlePaymentClick} 
          disabled={isProcessing || isLoading || !hasCurrencies}
          className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white py-2 px-4 sm:w-auto w-full"
        >
          {isLoading ? (
            <span className="flex items-center">
              <Spinner className="h-4 w-4 mr-2" />
              Loading...
            </span>
          ) : (
            `Pay with ${selectedCurrency}`
          )}
        </Button>
      </div>
      
      {amount >= 3001 && kycData?.status !== 'approved' && (
        <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
          <AlertTriangle className="h-4 w-4" />
          <span>KYC verification required for amounts $3,001 or more</span>
        </div>
      )}
      
      {(amount < 3001 || kycData?.status === 'approved') && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Secure payment processing by CoinPayments</span>
        </div>
      )}
    </div>
  );
};

export default CryptoPaymentTab;
