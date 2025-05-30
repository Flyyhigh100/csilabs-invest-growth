
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import CryptoPaymentTab from './CryptoPaymentTab';
import DirectCryptoPaymentTab from './DirectCryptoPaymentTab';
import { Wallet, Send } from 'lucide-react';

interface PaymentTabsProps {
  amount: number;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  walletAddress: string;
  handleStripeCryptoOnramp: () => Promise<any>;
  handleCoinPaymentWithCurrency: () => void;
  isProcessing: boolean;
  isKycNeeded: boolean;
  isWalletMissing: boolean;
  kycData: any;
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
  const [activeTab, setActiveTab] = useState('direct-crypto');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="direct-crypto" className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Direct Wallet</span>
          <span className="sm:hidden">Direct</span>
          <Badge variant="secondary" className="ml-1 text-xs">
            New
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="crypto" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Crypto</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="direct-crypto" className="space-y-4">
          <DirectCryptoPaymentTab 
            walletAddress={walletAddress} 
            amount={amount}
          />
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
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
      </div>
    </Tabs>
  );
};

export default PaymentTabs;
