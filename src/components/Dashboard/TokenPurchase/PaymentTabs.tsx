
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DirectCryptoPaymentTab from './DirectCryptoPaymentTab';
import { Send, Sparkles, Zap, TrendingUp } from 'lucide-react';

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
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-cbis-blue via-blue-600 to-cbis-teal p-8 md:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] group">
        {/* Animated Background Pattern */}
        <div 
          className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Animated Glow Effects */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Content */}
        <div className="relative z-10 text-center space-y-4">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/20 backdrop-blur-sm rounded-full border border-yellow-300/30">
            <Zap className="h-4 w-4 text-yellow-300 animate-pulse" />
            <span className="text-yellow-200 text-sm font-semibold tracking-wide uppercase">
              Exclusive Pre-Launch
            </span>
            <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Main Headline */}
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent animate-pulse">
                SPECIAL PRICING
              </span>
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-100">
              Buy Direct @ Current Spot Price
            </p>
          </div>
          
          {/* Value Proposition */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-white/90">
              <TrendingUp className="h-5 w-5 text-green-300" />
              <span className="font-semibold">No Platform Fees</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30"></div>
            <div className="flex items-center gap-2 text-white/90">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="font-semibold">Instant Processing</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30"></div>
            <div className="flex items-center gap-2 text-white/90">
              <Sparkles className="h-5 w-5 text-blue-300" />
              <span className="font-semibold">Limited Time Only</span>
            </div>
          </div>
          
          {/* Call to Action Hint */}
          <div className="mt-6">
            <p className="text-blue-200 text-lg font-medium">
              Choose your payment method below to get started
            </p>
            <div className="mt-2 flex justify-center">
              <div className="w-12 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-[-100%] group-hover:translate-x-[100%]" 
             style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          <TabsTrigger value="direct-crypto">Direct Crypto</TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
