
import React, { useEffect, useState } from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import TokenCalculator from '../TokenPurchase/TokenCalculator';
import WalletRequiredAlert from '../WalletRequiredAlert';
import BuyTokensTab from '../BuyTokensTab';
import WalletAddressForm from '../WalletAddressForm';
import CryptoOnboardingDialog from '../TokenPurchase/CryptoOnboardingDialog';
import WalletEducationPanel from '../TokenPurchase/WalletEducationPanel';
import WalletFundingStep from '../TokenPurchase/WalletFundingStep';
import EnhancedPurchaseGuide from '../TokenPurchase/EnhancedPurchaseGuide';
import PurchasePathSelector from '../TokenPurchase/PurchasePathSelector';
import { usePurchaseFlow } from '@/hooks/payments/usePurchaseFlow';
import { toast } from 'sonner';

export const WalletSection: React.FC<{
  isLoadingWallet: boolean;
  walletAddress: string | null;
  onWalletUpdated: () => void;
}> = ({ isLoadingWallet, walletAddress, onWalletUpdated }) => {
  const { 
    isNewToWallet,
    handleOnboardingComplete,
    markWalletSetupComplete,
    walletSetupComplete
  } = usePurchaseFlow();

  // Use local state to track when the wallet education is completed
  const [educationCompleted, setEducationCompleted] = useState(false);

  const handleWalletEducationComplete = () => {
    console.log("Wallet education complete");
    setEducationCompleted(true);
    markWalletSetupComplete();
    // Show toast feedback to the user
    toast.success("Moving to the next step", {
      description: "You can now fund your wallet"
    });
  };

  return (
    <Card id="wallet-address-section" className="bg-white rounded-lg shadow-sm overflow-hidden border border-blue-200 transition-all hover:shadow-md">
      <div className="h-2 bg-gradient-to-r from-cbis-blue to-cbis-teal"></div>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-cbis-blue/10 p-2 rounded-full">
            <Wallet className="h-5 w-5 text-cbis-blue" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Step 1: Connect Your Wallet</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Enter your ERC-20 wallet address to receive CSi tokens
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <CryptoOnboardingDialog onComplete={handleOnboardingComplete} />
        
        {isNewToWallet && !walletSetupComplete && !educationCompleted ? (
          <WalletEducationPanel onComplete={handleWalletEducationComplete} />
        ) : (
          <WalletAddressForm 
            existingWalletAddress={walletAddress || undefined} 
            onWalletUpdated={() => {
              onWalletUpdated();
              markWalletSetupComplete();
            }} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export const TokenPurchaseSection: React.FC<{
  walletAddress: string | null;
}> = ({ walletAddress }) => {
  const { 
    currentStep,
    needsRender, // Add this to ensure re-renders
    walletSetupComplete,
    walletFundingComplete, 
    markWalletFundingComplete,
    showCoinPaymentsOptions,
    showCoinPayments
  } = usePurchaseFlow();
  
  // Local state to trigger re-renders
  const [key, setKey] = useState(0);
  
  // Force re-render when state changes
  useEffect(() => {
    console.log("TokenPurchaseSection: State changed - walletSetupComplete:", walletSetupComplete);
    console.log("TokenPurchaseSection: Current step:", currentStep);
    console.log("TokenPurchaseSection: Wallet funding complete:", walletFundingComplete);
    
    // Update the key to force a re-render
    setKey(prev => prev + 1);
  }, [walletSetupComplete, currentStep, walletFundingComplete, needsRender]);

  return (
    <>
      <EnhancedPurchaseGuide currentStep={currentStep} />
      
      {walletSetupComplete && !walletFundingComplete && (
        <WalletFundingStep 
          key={`funding-step-${key}`}
          isExpanded={true}
          onComplete={markWalletFundingComplete}
          onStartFunding={() => {
            // This will trigger the Stripe Crypto tab in the next component
            markWalletFundingComplete();
          }}
        />
      )}
      
      {walletFundingComplete && (
        <Card 
          key={`purchase-card-${key}`}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md mt-6"
        >
          <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <ArrowRight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-800">Step 3: Purchase Tokens</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Choose your payment method to purchase CSi tokens
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 rounded-sm pb-6">
            <WalletRequiredAlert walletAddress={walletAddress} />
            
            {!showCoinPaymentsOptions && walletAddress && (
              <PurchasePathSelector 
                amount={100} // Default amount
                isProcessing={false}
                isWalletMissing={!walletAddress}
                onSelectCoinPayments={showCoinPayments}
                onSelectDex={() => {
                  window.open('https://app.uniswap.org/', '_blank');
                }}
              />
            )}
            
            {showCoinPaymentsOptions && (
              <BuyTokensTab walletAddress={walletAddress} />
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};
