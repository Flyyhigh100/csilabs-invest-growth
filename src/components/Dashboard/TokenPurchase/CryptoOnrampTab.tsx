
import React, { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface CryptoOnrampTabProps {
  amount: number;
  walletAddress: string;
  isProcessing: boolean;
  isWalletMissing: boolean;
  onInitiateOnramp: () => Promise<{success: boolean, redirect_url?: string, error?: string}>;
}

const CryptoOnrampTab: React.FC<CryptoOnrampTabProps> = ({
  amount,
  walletAddress,
  isProcessing,
  isWalletMissing,
  onInitiateOnramp
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if environment has Stripe publishable key
  const missingStripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_CRYPTO ? false : true;
  
  const handleBuyCryptoClick = async () => {
    if (isWalletMissing) {
      toast.error("Wallet Address Required", {
        description: "You need to provide a wallet address to receive your tokens.",
      });
      
      setTimeout(() => {
        document.getElementById('wallet-address-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
      
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      const result = await onInitiateOnramp();
      
      if (!result.success || !result.redirect_url) {
        throw new Error(result.error || 'Failed to create payment session');
      }
      
      // Redirect to Stripe's hosted onramp page
      window.location.href = result.redirect_url;
      
    } catch (err: any) {
      console.error('Error initializing Stripe Onramp redirect:', err);
      setError(err.message || 'Failed to initialize payment');
      toast.error('Payment initialization failed', {
        description: err.message || 'Please try again or contact support'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-white p-2 rounded-full border border-gray-200">
          <CreditCard className="h-6 w-6 text-cbis-blue" />
        </div>
        <div>
          <h4 className="font-medium text-gray-800">Buy Crypto with Stripe</h4>
          <p className="text-sm text-gray-600 mt-1">
            Purchase cryptocurrency directly with your credit card, Apple Pay, or Google Pay.
          </p>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-2">
            <div>{error}</div>
            {missingStripeKey && (
              <div className="mt-2">
                <strong>Administrator note:</strong> Please configure STRIPE_SECRET_KEY_CRYPTO in your environment variables.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Widget container */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">Total amount:</p>
            <p className="text-lg font-medium text-gray-800">${amount.toLocaleString()}</p>
          </div>
          <Button 
            onClick={handleBuyCryptoClick} 
            disabled={isProcessing || isWalletMissing || isLoading || missingStripeKey}
            className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white py-2 px-4 sm:w-auto w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Buy Crypto"
            )}
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        <p>
          Stripe Crypto Onramp services are provided by Stripe, Inc. and its affiliates.
          Cryptocurrencies may be subject to high price volatility.
        </p>
      </div>
    </div>
  );
};

export default CryptoOnrampTab;
