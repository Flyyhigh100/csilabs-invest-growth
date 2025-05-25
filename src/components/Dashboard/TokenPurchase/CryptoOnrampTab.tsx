
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CreditCard, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { loadStripeOnrampScripts } from '@/lib/loadStripeOnramp';

interface CryptoOnrampTabProps {
  amount: number;
  walletAddress: string;
  isProcessing: boolean;
  isWalletMissing: boolean;
  onInitiateOnramp: () => Promise<{success: boolean, redirect_url?: string, session_id?: string, error?: string, details?: string}>;
}

const CryptoOnrampTab: React.FC<CryptoOnrampTabProps> = ({
  amount,
  walletAddress,
  isProcessing,
  isWalletMissing
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [suggestedFix, setSuggestedFix] = useState<string | null>(null);
  
  // Load Stripe Onramp scripts on component mount
  useEffect(() => {
    loadStripeOnrampScripts();
  }, []);
  
  // Check if environment has Stripe publishable key
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_CRYPTO;
  const missingStripeKey = !stripePublishableKey;
  
  const handleBuyCryptoClick = () => {
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
    
    if (!window.StripeOnramp) {
      toast.error('Stripe script not loaded yet, please wait a second.');
      // Try to load scripts again
      loadStripeOnrampScripts();
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setErrorDetails(null);
      setSuggestedFix(null);

      console.log("Initiating Stripe Crypto Onramp redirect with client-side URL generation...");
      
      // Create the standalone onramp instance
      const standalone = window.StripeOnramp.Standalone({
        source_currency: 'usd',
        amount: { source_amount: String(amount) },
        destination_currency: 'usdc',  // Default to USDC, could be parameterized
        destination_network: 'polygon' // Default to Polygon, could be parameterized
      });
      
      // Get the redirect URL
      const url = standalone.getUrl();
      console.log('Redirecting to', url);
      
      // Redirect the user to Stripe's hosted onramp
      toast.success("Redirecting to Stripe...", {
        description: "You will be redirected to complete your purchase"
      });
      
      window.location.href = url;
    } catch (err: any) {
      console.error('Error initializing Stripe Onramp redirect:', err);
      
      let errorMessage = err.message || 'Failed to initialize Stripe Onramp';
      
      setError(errorMessage);
      setErrorDetails(err.details || null);
      setSuggestedFix(err.suggestion || null);
      
      toast.error('Stripe Onramp initialization failed', {
        description: errorMessage || 'Please try again or contact support'
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
          <h4 className="font-medium text-gray-800">Purchase Crypto with Stripe</h4>
          <p className="text-sm text-gray-600 mt-1">
            Purchase cryptocurrency directly with your credit card, Apple Pay, or Google Pay.
          </p>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-2">
            <div>{error}</div>
            {errorDetails && (
              <div className="mt-2 text-sm opacity-80">
                <strong>Details:</strong> {errorDetails}
              </div>
            )}
            {suggestedFix && (
              <div className="mt-2 text-sm bg-gray-100 p-2 rounded-md border border-gray-300">
                <strong>Suggested Fix:</strong> {suggestedFix}
              </div>
            )}
            {missingStripeKey && (
              <div className="mt-2 flex items-start gap-1">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Note:</strong> Please configure STRIPE_PUBLISHABLE_KEY_CRYPTO in your environment.
                </span>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Admin instructions - only show in development */}
      {import.meta.env.DEV && (
        <Alert variant="default" className="bg-blue-50 border-blue-200 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            <p className="font-medium">Developer Setup Instructions:</p>
            <ol className="list-decimal list-inside ml-2 mt-1 text-sm space-y-1">
              <li>Ensure you have a Stripe account with Crypto Onramp enabled.</li>
              <li>The client-side Onramp doesn't require API keys in the backend.</li>
              <li>Make sure the Stripe scripts are loading properly (check console).</li>
              <li>Test with various amounts to ensure redirects work correctly.</li>
            </ol>
            <div className="mt-2 flex items-center">
              <a 
                href="https://docs.stripe.com/crypto/onramp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
              >
                Stripe Crypto Onramp Documentation <ExternalLink className="h-3 w-3" />
              </a>
            </div>
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
            disabled={isProcessing || isWalletMissing || isLoading}
            className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white py-2 px-4 sm:w-auto w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Purchase Crypto"
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
