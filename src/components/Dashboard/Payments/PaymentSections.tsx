
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
import { RefreshCcw } from 'lucide-react';

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
  
  const [educationCompleted, setEducationCompleted] = useState(false);
  
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
        <div className="py-8 flex justify-center">
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
      <WalletAddressForm 
        existingWalletAddress={walletAddress || undefined} 
        onWalletUpdated={() => {
          onWalletUpdated();
          markWalletSetupComplete();
          toast.success("Wallet address saved", {
            description: "You can now proceed to the next step"
          });
          setActiveSection('funding');
        }} 
      />
    );
  };
  
  // Render the funding section content
  const renderFundingSectionContent = () => {
    return (
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
    );
  };
  
  // Render the purchase section content
  const renderPurchaseSectionContent = () => {
    if (!walletAddress) {
      return <WalletRequiredAlert walletAddress={walletAddress} />;
    }
    
    if (!showCoinPaymentsOptions) {
      return (
        <PurchasePathSelector 
          amount={100} // Default amount
          isProcessing={false}
          isWalletMissing={!walletAddress}
          onSelectCoinPayments={() => {
            showCoinPayments();
            setDirectPurchase(true);
            toast.success("Payment options loaded");
          }}
          onSelectDex={() => {
            window.open('https://app.uniswap.org/', '_blank');
          }}
          setDirectPurchase={setDirectPurchase}
        />
      );
    }
    
    return <BuyTokensTab walletAddress={walletAddress} isDirectPurchase={isDirectPurchase} />;
  };

  // console.log debug info
  console.log("TokenPurchaseSections state:", { 
    isNewToWallet, 
    activeSection, 
    sectionsCompleted, 
    educationCompleted,
    isDirectPurchase
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetFlow}
          className="flex items-center gap-1"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          <span>Reset Guide</span>
        </Button>
      </div>
        
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
    </div>
  );
};
