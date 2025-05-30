
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import CryptoPaymentTab from './CryptoPaymentTab';
import CardPaymentTab from './CardPaymentTab';
import DirectCryptoPaymentTab from './DirectCryptoPaymentTab';
import { Wallet, CreditCard, Send } from 'lucide-react';

interface PaymentTabsProps {
  amount: number;
  walletAddress: string;
  isProcessing: boolean;
  onPaymentInitiated?: () => void;
}

const PaymentTabs: React.FC<PaymentTabsProps> = ({
  amount,
  walletAddress,
  isProcessing,
  onPaymentInitiated
}) => {
  const [activeTab, setActiveTab] = useState('direct-crypto');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
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
        <TabsTrigger value="card" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">Card</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="direct-crypto" className="space-y-4">
          <DirectCryptoPaymentTab walletAddress={walletAddress} />
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <CryptoPaymentTab 
            amount={amount}
            walletAddress={walletAddress}
            isProcessing={isProcessing}
            onPaymentInitiated={onPaymentInitiated}
          />
        </TabsContent>

        <TabsContent value="card" className="space-y-4">
          <CardPaymentTab 
            amount={amount}
            walletAddress={walletAddress}
            isProcessing={isProcessing}
            onPaymentInitiated={onPaymentInitiated}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default PaymentTabs;
