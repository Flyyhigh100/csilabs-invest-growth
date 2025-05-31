
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DirectCryptoPaymentTab from './DirectCryptoPaymentTab';
import { Send, Sparkles } from 'lucide-react';

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
    <div className="w-full">
      {/* Enhanced Prominent Header */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-cbis-blue via-blue-600 to-cbis-teal p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Centered Content */}
        <div className="relative z-10 text-center">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-2">
            Limited Time Pre-Launch Special!
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl md:text-2xl font-medium">
            Buy Direct @ Current Spot Price
          </p>
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          <TabsTrigger value="direct-crypto">Direct Crypto</TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <TabsContent value="direct-crypto" className="space-y-4 p-0 m-0">
            <DirectCryptoPaymentTab 
              walletAddress={walletAddress} 
              amount={amount}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PaymentTabs;
