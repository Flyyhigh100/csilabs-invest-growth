
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
      {/* Enhanced Prominent Feature Card */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-cbis-blue via-blue-600 to-cbis-teal p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
              <Send className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                <span className="text-yellow-300 text-sm font-semibold tracking-wide uppercase">
                  Limited Time
                </span>
              </div>
              <h3 className="text-white text-lg sm:text-xl font-bold leading-tight">
                Pre-Launch Special!
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">
                Buy Direct @ Current Spot Price
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1 text-sm font-semibold shadow-md animate-pulse"
            >
              New
            </Badge>
            <div className="hidden sm:block h-8 w-px bg-white/30"></div>
            <div className="text-right">
              <div className="text-white/80 text-xs uppercase tracking-wide">No Fees</div>
              <div className="text-white text-sm font-semibold">Direct Payment</div>
            </div>
          </div>
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
