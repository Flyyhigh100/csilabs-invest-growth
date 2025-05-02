
import React, { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CreditCard, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface CryptoOnrampTabProps {
  amount: number;
  walletAddress: string;
  isProcessing: boolean;
  isWalletMissing: boolean;
  onInitiateOnramp: () => Promise<{success: boolean, redirect_url?: string, client_secret?: string, session_id?: string, error?: string, details?: string}>;
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
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [suggestedFix, setSuggestedFix] = useState<string | null>(null);
  
  // Check if environment has Stripe publishable key
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_CRYPTO;
  const missingStripeKey = !stripePublishableKey;
  
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
      setErrorDetails(null);
      setSuggestedFix(null);

      console.log("Initiating Stripe Crypto Onramp redirect...");
      const result = await onInitiateOnramp();
      
      if (!result.success) {
        console.error("Onramp session creation failed:", result);
        throw new Error(result.error || 'Failed to create payment session');
      }
      
      // Handle different response types - either direct redirect_url or client_secret
      if (result.redirect_url) {
        console.log("Received redirect URL from server, redirecting user...");
        toast.success("Redirecting to Stripe...", {
          description: "You will be redirected to complete your purchase"
        });
        
        // Direct redirect
        window.location.href = result.redirect_url;
      } 
      else if (result.client_secret && result.session_id) {
        console.log("Received client secret, constructing redirect URL...");
        toast.success("Redirecting to Stripe...", {
          description: "You will be redirected to complete your purchase"
        });
        
        // Construct the URL for Stripe's hosted onramp page
        const redirectUrl = `https://crypto.stripe.com/onramp?session_id=${result.session_id}&client_secret=${result.client_secret}`;
        window.location.href = redirectUrl;
      }
      else {
        throw new Error("No redirect information received from server");
      }
    } catch (err: any) {
      console.error('Error initializing Stripe Onramp redirect:', err);
      
      // Extract detailed error information if available
      let errorMessage = err.message || 'Failed to initialize payment';
      let details = '';
      let suggestion = null;
      
      if (err.details) {
        details = err.details;
      } else if (typeof err === 'object') {
        if (err.response) {
          try {
            const responseData = await err.response.json();
            if (responseData.details) details = responseData.details;
            if (responseData.suggestion) suggestion = responseData.suggestion;
            if (responseData.error && errorMessage === 'Failed to initialize payment') {
              errorMessage = responseData.error;
            }
          } catch (e) {
            // Could not parse response JSON
            console.error("Could not parse error response:", e);
          }
        } else if (err.message) {
          errorMessage = err.message;
          if (err.suggestion) suggestion = err.suggestion;
          if (err.details) details = err.details;
        }
      }
      
      setError(errorMessage);
      setErrorDetails(details);
      setSuggestedFix(suggestion);
      
      toast.error('Payment initialization failed', {
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
          <h4 className="font-medium text-gray-800">Buy Crypto with Stripe</h4>
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
                  <strong>Note:</strong> Please configure STRIPE_SECRET_KEY_CRYPTO and STRIPE_PUBLISHABLE_KEY_CRYPTO in your Supabase Edge Function secrets.
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
              <li>Verify your Stripe API key has <code>crypto.onrampSessions: write</code> permission.</li>
              <li>Set both <code>STRIPE_SECRET_KEY_CRYPTO</code> and <code>STRIPE_PUBLISHABLE_KEY_CRYPTO</code> in Supabase secrets.</li>
              <li>Make sure you're using the latest Stripe API version that supports Crypto Onramp.</li>
            </ol>
            <div className="mt-2 flex items-center">
              <a 
                href="https://dashboard.stripe.com/apikeys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
              >
                Check Stripe API Keys <ExternalLink className="h-3 w-3" />
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
