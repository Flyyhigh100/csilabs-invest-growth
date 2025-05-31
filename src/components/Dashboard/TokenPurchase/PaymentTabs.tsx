
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DirectCryptoPaymentTab from './DirectCryptoPaymentTab';
import { Send, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();

  return (
    <div className="w-full">
      {/* Enhanced Prominent Feature Card */}
      <div className={cn(
        "relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-cbis-blue via-blue-600 to-cbis-teal shadow-lg hover:shadow-xl transition-all duration-300",
        isMobile ? "p-4" : "p-6"
      )}>
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Content */}
        <div className={cn("relative z-10 flex items-center gap-3", isMobile && "gap-2")}>
          <div className={cn("p-2 bg-white/20 rounded-full backdrop-blur-sm", isMobile && "p-1.5")}>
            <Send className={cn("h-6 w-6 text-white", isMobile && "h-5 w-5")} />
          </div>
          <div className="flex-1">
            <div className={cn("flex items-center gap-2 mb-1", isMobile && "gap-1 mb-0.5")}>
              <Sparkles className={cn("h-4 w-4 text-yellow-300 animate-pulse", isMobile && "h-3 w-3")} />
              <span className={cn("text-yellow-300 font-semibold tracking-wide uppercase", isMobile ? "text-xs" : "text-sm")}>
                Limited Time
              </span>
            </div>
            <h3 className={cn("text-white font-bold leading-tight", isMobile ? "text-lg" : "text-xl")}>
              Pre-Launch Special!
            </h3>
            <p className={cn("text-blue-100", isMobile ? "text-sm" : "text-base")}>
              Buy Direct @ Current Spot Price
            </p>
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

        <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", isMobile && "rounded-lg")}>
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
