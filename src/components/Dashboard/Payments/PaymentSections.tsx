
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PurchaseStepsAccordion from '../TokenPurchase/PurchaseStepsAccordion';
import { usePurchaseFlow } from '@/hooks/payments/usePurchaseFlow';
import CryptoOnboardingDialog from '../TokenPurchase/CryptoOnboardingDialog';
import WalletEducationPanel from '../TokenPurchase/WalletEducationPanel';
import WalletAddressForm from '../WalletAddressForm';
import WalletFundingStep from '../TokenPurchase/WalletFundingStep';
import WalletRequiredAlert from '../WalletRequiredAlert';
import PurchasePathSelector from '../TokenPurchase/PurchasePathSelector';
import BuyTokensTab from '../BuyTokensTab';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import EnhancedPurchaseGuide from '../TokenPurchase/EnhancedPurchaseGuide';
import { useWalletAddress } from '../WalletAddress/useWalletAddress';

// Define the CSI Token Uniswap URL as a constant
const CSI_TOKEN_UNISWAP_URL = 'https://app.uniswap.org/explore/tokens/polygon/0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';

export const TokenPurchaseSections: React.FC<{
  isLoadingWallet: boolean;
  walletAddress: string | null;
  onWalletUpdated: () => void;
}> = ({ isLoadingWallet, walletAddress, onWalletUpdated }) => {
  const { 
    isNewToWallet,
    activeSection,
    sectionsCompleted,
    setActiveSection,
    handleOnboardingComplete,
    markWalletSetupComplete,
    markWalletFundingComplete,
    showCoinPaymentsOptions,
    showCoinPayments,
    setDirectPurchase,
    resetFlow,
    needsRender,
    isDirectPurchase
  } = usePurchaseFlow();
  
  // Get wallet data from the enhanced hook
  const {
    walletAddress: polygonAddress,
    solanaWalletAddress,
    preferredNetwork,
    hasAnyWallet
  } = useWalletAddress();
  
  const [educationCompleted, setEducationCompleted] = useState(false);
  const isMobile = useIsMobile();
  
  // Calculate current step for the EnhancedPurchaseGuide
  const getCurrentStep = () => {
    if (activeSection === 'wallet') return 1;
    if (activeSection === 'funding') return 2;
    if (activeSection === 'purchase') return 3;
    return 1;
  };
  
  // Force a re-render when state changes in usePurchaseFlow
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [activeSection, sectionsCompleted.wallet, sectionsCompleted.funding, sectionsCompleted.purchase, needsRender]);

  // Handle wallet education completion
  const handleWalletEducationComplete = () => {
    console.log("Wallet education complete");
    setEducationCompleted(true);
    markWalletSetupComplete();
    toast.success("Wallet setup completed", {
      description: "You can now proceed to the next step"
    });
    
    // Move to the next section automatically
    setActiveSection('funding');
  };

  // Render the wallet section content
  const renderWalletSectionContent = () => {
    if (isLoadingWallet) {
      return (
        <div className={cn("py-8 flex justify-center", isMobile && "py-6")}>
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (isNewToWallet && !educationCompleted && !sectionsCompleted.wallet) {
      return (
        <WalletEducationPanel onComplete={handleWalletEducationComplete} />
      );
    }
    
    return (
      <Card className="border-blue-100 bg-white">
        <CardContent className={cn("p-5", isMobile && "p-3")}>
          <WalletAddressForm 
            existingWalletAddress={polygonAddress || undefined}
            existingSolanaWalletAddress={solanaWalletAddress || undefined}
            existingPreferredNetwork={preferredNetwork}
            onWalletUpdated={() => {
              onWalletUpdated();
              markWalletSetupComplete();
              toast.success("Wallet address saved", {
                description: "You can now proceed to the next step"
              });
              setActiveSection('funding');
            }} 
          />
        </CardContent>
      </Card>
    );
  };
  
  // Render the funding section content
  const renderFundingSectionContent = () => {
    return (
      <Card className="border-blue-100 bg-white">
        <CardContent className={cn("p-5", isMobile && "p-3")}>
          <WalletFundingStep 
            walletAddress={walletAddress}
            onComplete={() => {
              markWalletFundingComplete();
              toast.success("Wallet funding noted", {
                description: "You can now purchase tokens"
              });
              setActiveSection('purchase');
            }}
            onStartFunding={() => {
              markWalletFundingComplete();
              setActiveSection('purchase');
            }}
          />
        </CardContent>
      </Card>
    );
  };
  
  // Render the purchase section content
  const renderPurchaseSectionContent = () => {
    if (!walletAddress) {
      return <WalletRequiredAlert walletAddress={walletAddress} />;
    }
    
    if (!showCoinPaymentsOptions) {
      return (
        <Card className="border-blue-100 bg-white">
          <CardContent className={cn("p-5", isMobile && "p-3")}>
            <PurchasePathSelector 
              amount={100} // Default amount
              isProcessing={false}
              isWalletMissing={!walletAddress}
              onSelectCoinPayments={() => {
                showCoinPayments();
                setDirectPurchase(true);
                toast.success("Payment options loaded");
              }}
              setDirectPurchase={setDirectPurchase}
            />
          </CardContent>
        </Card>
      );
    }
    
    return <BuyTokensTab walletAddress={walletAddress} isDirectPurchase={isDirectPurchase} />;
  };

  return (
    <Card className={cn("shadow-md border-cbis-blue/10", isMobile && "shadow-sm")}>
      <div className="h-2 bg-gradient-to-r from-cbis-blue to-cbis-teal"></div>
      <CardContent className={cn("p-6", isMobile && "p-3")}>
        <div className={cn("flex justify-end mb-4", isMobile && "mb-3")}>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "sm"}
            onClick={resetFlow}
            className="flex items-center gap-1"
          >
            <RefreshCcw className={cn("h-3.5 w-3.5", isMobile && "h-3 w-3")} />
            <span className={cn(isMobile && "text-xs")}>Reset Guide</span>
          </Button>
        </div>
        
        {isMobile && (
          <div className="mb-4">
            <EnhancedPurchaseGuide currentStep={getCurrentStep()} />
          </div>
        )}
          
        <CryptoOnboardingDialog onComplete={handleOnboardingComplete} />
        
        <PurchaseStepsAccordion
          key={`steps-accordion-${key}`}
          activeSection={activeSection}
          sectionsCompleted={sectionsCompleted}
          onSectionChange={setActiveSection}
          children={{
            wallet: renderWalletSectionContent(),
            funding: renderFundingSectionContent(),
            purchase: renderPurchaseSectionContent()
          }}
        />
      </CardContent>
    </Card>
  );
};
