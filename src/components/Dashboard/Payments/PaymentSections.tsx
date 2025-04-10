
import React from 'react';
import { Wallet, ArrowRight, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  showTooltip?: boolean;
  tooltipContent?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  showTooltip = false,
  tooltipContent
}) => {
  return (
    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="bg-cbis-blue/10 p-2 rounded-full">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {showTooltip && tooltipContent && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0 ml-auto mr-0">
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-3">
                {tooltipContent}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export const WalletSection: React.FC<{
  isLoadingWallet: boolean;
  walletAddress: string | null;
  onWalletUpdated: () => Promise<void>;
}> = ({ isLoadingWallet, walletAddress, onWalletUpdated }) => {
  return (
    <div id="wallet-address-section" className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md">
      <SectionHeader
        icon={<Wallet className="h-5 w-5 text-cbis-blue" />}
        title="Step 1: Set Up Your Wallet"
        showTooltip={true}
        tooltipContent={
          <div className="space-y-2">
            <p className="font-medium text-sm">Why do I need a wallet?</p>
            <p className="text-xs">Your wallet address is where your CSi tokens will be sent after purchase. Think of it like a digital bank account for your tokens.</p>
          </div>
        }
      />
      
      <div className="p-5">
        {isLoadingWallet ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cbis-blue"></div>
          </div>
        ) : (
          <WalletAddressForm 
            existingWalletAddress={walletAddress || undefined} 
            onWalletUpdated={onWalletUpdated} 
          />
        )}
      </div>
    </div>
  );
};

export const TokenPurchaseSection: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletAddress: string | null;
}> = ({ activeTab, setActiveTab, walletAddress }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md">
      <SectionHeader
        icon={<ArrowRight className="h-5 w-5 text-cbis-blue" />}
        title="Step 2: Purchase or Sell Tokens"
      />
      
      <div className="p-5">
        <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6 bg-gray-100">
            <TabsTrigger 
              value="buy" 
              className="data-[state=active]:bg-cbis-blue data-[state=active]:text-white transition-all"
            >
              Buy Tokens
            </TabsTrigger>
            <TabsTrigger 
              value="sell" 
              className="data-[state=active]:bg-cbis-blue data-[state=active]:text-white transition-all"
            >
              Sell Tokens
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <WalletRequiredAlert walletAddress={walletAddress} />
            <BuyTokensTab walletAddress={walletAddress} />
          </TabsContent>
          
          <TabsContent value="sell" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <WalletRequiredAlert walletAddress={walletAddress} />
            <SellTokensTab walletAddress={walletAddress} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Import statements to be added at the top
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletAddressForm from '@/components/Dashboard/WalletAddressForm';
import WalletRequiredAlert from '@/components/Dashboard/WalletRequiredAlert';
import BuyTokensTab from '@/components/Dashboard/BuyTokensTab';
import SellTokensTab from '@/components/Dashboard/SellTokensTab';
