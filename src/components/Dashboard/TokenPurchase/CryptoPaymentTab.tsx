import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';
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
  const { currencies, isLoading, error, refreshCurrencies } = useAvailableCurrencies();
  
  const hasCurrencies = currencies && Object.keys(currencies).length > 0;
  
  React.useEffect(() => {
    if (!isLoading && hasCurrencies) {
      const currencyCodes = Object.keys(currencies);
      if (!currencyCodes.includes(selectedCurrency)) {
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
            onClick={refreshCurrencies} 
            disabled={isLoading || isProcessing}
            className="text-xs flex items-center gap-1"
          >
            {isLoading ? <Spinner className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
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
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Spinner className="h-4 w-4 mr-2" />
                <span>Loading available currencies...</span>
              </div>
            ) : hasCurrencies ? (
              Object.entries(currencies).map(([code, data]) => (
                <SelectItem 
                  key={code} 
                  value={code} 
                  className="hover:bg-blue-50"
                >
                  {data.name || code}
                </SelectItem>
              ))
            ) : (
              <div className="p-4 text-red-500 text-center">
                {error || "No currencies available"}
              </div>
            )}
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
