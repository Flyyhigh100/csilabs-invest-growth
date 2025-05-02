
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Wallet } from 'lucide-react';
import CryptoOnrampTab from './CryptoOnrampTab';
import CryptoPaymentTab from './CryptoPaymentTab';
import { KycVerificationData } from '@/hooks/kyc/types';

interface PaymentTabsProps {
  amount: number;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  walletAddress: string | null;
  handleStripeCryptoOnramp: () => Promise<{success: boolean, clientSecret?: string, sessionId?: string}>;
  handleCoinPaymentWithCurrency: () => void;
  isProcessing: boolean;
  isKycNeeded: boolean;
  isWalletMissing: boolean;
  kycData: KycVerificationData | null;
}

const PaymentTabs: React.FC<PaymentTabsProps> = ({
  amount,
  selectedCurrency,
  setSelectedCurrency,
  walletAddress,
  handleStripeCryptoOnramp,
  handleCoinPaymentWithCurrency,
  isProcessing,
  isKycNeeded,
  isWalletMissing,
  kycData
}) => {
  return (
    <Tabs defaultValue="crypto-onramp" className="w-full">
      <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4 bg-gray-100">
        <TabsTrigger value="crypto-onramp" className="data-[state=active]:bg-blue-50 data-[state=active]:text-cbis-blue">
          <CreditCard className="mr-2 h-4 w-4" />
          Stripe Crypto
        </TabsTrigger>
        <TabsTrigger value="crypto" className="data-[state=active]:bg-blue-50 data-[state=active]:text-cbis-blue">
          <Wallet className="mr-2 h-4 w-4" />
          More Crypto Options
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="crypto-onramp" className="border rounded-lg p-4 border-blue-100 bg-blue-50/20">
        <CryptoOnrampTab 
          amount={amount}
          walletAddress={walletAddress || ''}
          isProcessing={isProcessing}
          isWalletMissing={isWalletMissing}
          onInitiateOnramp={handleStripeCryptoOnramp}
        />
      </TabsContent>
      
      <TabsContent value="crypto" className="border rounded-lg p-4 border-blue-100 bg-blue-50/20">
        <CryptoPaymentTab 
          amount={amount}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          handleCoinPaymentWithCurrency={handleCoinPaymentWithCurrency}
          isProcessing={isProcessing}
          isKycNeeded={isKycNeeded}
          isWalletMissing={isWalletMissing}
          kycData={kycData}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PaymentTabs;
