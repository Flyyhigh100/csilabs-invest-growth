
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KycVerificationData } from '@/hooks/kyc/types';

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
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <Label htmlFor="crypto-currency" className="text-sm text-gray-700 font-medium">Select Cryptocurrency</Label>
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency} disabled={isProcessing}>
          <SelectTrigger id="crypto-currency" className="mt-2 border border-gray-200 bg-white focus:ring-2 focus:ring-cbis-blue focus:border-cbis-blue transition-all">
            <SelectValue placeholder="Select cryptocurrency" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            <SelectItem value="USDT" className="hover:bg-blue-50">USDT (Tether)</SelectItem>
            <SelectItem value="BTC" className="hover:bg-blue-50">Bitcoin (BTC)</SelectItem>
            <SelectItem value="ETH" className="hover:bg-blue-50">Ethereum (ETH)</SelectItem>
            <SelectItem value="DOGE" className="hover:bg-blue-50">Dogecoin (DOGE)</SelectItem>
            <SelectItem value="XRP" className="hover:bg-blue-50">Ripple (XRP)</SelectItem>
            <SelectItem value="LTCT" className="hover:bg-blue-50">Litecoin Testnet (LTCT)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">Total amount:</p>
          <p className="text-lg font-medium text-gray-800">${amount.toLocaleString()}</p>
        </div>
        <Button 
          onClick={handleCoinPaymentWithCurrency} 
          disabled={isProcessing || isWalletMissing || isKycNeeded}
          className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white py-2 px-4 sm:w-auto w-full"
        >
          Pay with {selectedCurrency}
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
