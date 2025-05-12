
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface WalletFundingStepProps {
  onComplete: () => void;
  onStartFunding: () => void;
  walletAddress: string | null;
}

const WalletFundingStep: React.FC<WalletFundingStepProps> = ({
  onComplete,
  onStartFunding,
  walletAddress
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isMobile = useIsMobile();
  
  const handleWalletFunded = () => {
    setIsProcessing(true);
    console.log("User clicked 'I've already funded my wallet'");

    // Add a slight delay for visual feedback
    setTimeout(() => {
      onComplete();
      setIsProcessing(false);
    }, 300);
  };

  const handleStartFunding = async () => {
    setIsProcessing(true);
    console.log("User clicked 'Fund My Wallet with Stripe'");

    // First mark the funding step as complete
    onStartFunding();
    try {
      toast.success("Redirecting to Stripe...", {
        description: "You'll be redirected to fund your wallet in a moment"
      });

      // Direct redirect to crypto.link.com
      console.log("Redirecting to https://crypto.link.com/");
      window.location.href = "https://crypto.link.com/";
    } catch (error) {
      console.error("Error redirecting:", error);
      toast.error("Failed to redirect", {
        description: "Please try again or contact support"
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">How to Fund Your Wallet</h3>
        <ul className="space-y-3 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <div className="min-w-4 mt-0.5">1.</div>
            <p>Use Stripe Crypto to purchase cryptocurrency directly with your credit card, Apple Pay, or Google Pay.</p>
          </li>
          <li className="flex items-start gap-2">
            <div className="min-w-4 mt-0.5">2.</div>
            <p>Recommended crypto options to purchase CSL tokens: BTC, Ethereum, Polygon, Solana, USDC (on Polygon or Solana).</p>
          </li>
          <li className="flex items-start gap-2">
            <div className="min-w-4 mt-0.5">3.</div>
            <p>Follow the Stripe process to complete your purchase and fund your wallet.</p>
          </li>
        </ul>
      </div>
      
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-700">
          Note: Some contributors may need to present identity documents to comply with Stripe's AML/KYC Policy.
        </AlertDescription>
      </Alert>
      
      <div className={cn(
        "flex gap-3 pt-2",
        isMobile ? "flex-col" : "flex-row"
      )}>
        <Button 
          onClick={handleStartFunding} 
          className={cn(
            "bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white",
            isMobile ? "w-full" : "flex-1"
          )} 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </> 
          ) : (
            "Fund My Wallet with Stripe"
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleWalletFunded} 
          className={isMobile ? "w-full" : "flex-1"} 
          disabled={isProcessing}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          My wallet is funded
        </Button>
      </div>
    </div>
  );
};

export default WalletFundingStep;
