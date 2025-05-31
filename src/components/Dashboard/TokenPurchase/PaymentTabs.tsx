
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DirectCryptoPaymentTab from './DirectCryptoPaymentTab';
import { Send } from 'lucide-react';

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
      <TabsList className="grid w-full grid-cols-1">
        <TabsTrigger value="direct-crypto" className="flex items-center gap-2 text-center px-2">
          <Send className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            Limited Time Pre-Launch Special! Buy Direct @ Current Spot Price
          </span>
          <Badge variant="secondary" className="ml-1 text-xs flex-shrink-0">
            New
          </Badge>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="direct-crypto" className="space-y-4">
          <DirectCryptoPaymentTab 
            walletAddress={walletAddress} 
            amount={amount}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default PaymentTabs;
