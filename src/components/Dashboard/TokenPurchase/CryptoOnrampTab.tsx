
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useSessionStorage } from '@/hooks/useSessionStorage';

interface CryptoOnrampTabProps {
  amount: number;
  walletAddress: string;
  isProcessing: boolean;
  isWalletMissing: boolean;
  onInitiateOnramp: () => Promise<{success: boolean, clientSecret?: string, sessionId?: string, error?: string}>;
}

declare global {
  interface Window {
    StripeOnramp?: any;
    stripeOnrampInstance?: any;
  }
}

const CryptoOnrampTab: React.FC<CryptoOnrampTabProps> = ({
  amount,
  walletAddress,
  isProcessing,
  isWalletMissing,
  onInitiateOnramp
}) => {
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isLoadingWidget, setIsLoadingWidget] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onrampElementRef = useRef<HTMLDivElement>(null);
  const [sessionData, setSessionData] = useSessionStorage<any>('crypto_onramp_session', null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  
  // Check for Stripe publishable key
  useEffect(() => {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_CRYPTO;
    if (!stripeKey) {
      console.error('Missing Stripe Crypto Onramp publishable key');
      setApiKeyMissing(true);
      setError('Missing Stripe API key configuration');
    }
  }, []);
  
  // Load Stripe Scripts
  useEffect(() => {
    // Skip if scripts are already loaded or there's an API key error
    if (window.StripeOnramp || apiKeyMissing) return;
    if (document.querySelector('script[src="https://js.stripe.com/v3/"]') &&
        document.querySelector('script[src="https://crypto-js.stripe.com/crypto-onramp-outer.js"]')) {
      return;
    }
    
    // Clean up any existing stripe instances
    if (window.stripeOnrampInstance) {
      try {
        delete window.stripeOnrampInstance;
      } catch (e) {
        console.warn('Error cleaning up old Stripe instance:', e);
      }
    }
    
    const loadScripts = async () => {
      setIsLoadingScript(true);
      setError(null);
      
      try {
        // Load Stripe.js first
        const stripeScript = document.createElement('script');
        stripeScript.src = 'https://js.stripe.com/v3/';
        stripeScript.async = true;
        
        const stripePromise = new Promise((resolve, reject) => {
          stripeScript.onload = resolve;
          stripeScript.onerror = (e) => {
            console.error('Failed to load Stripe.js:', e);
            reject(new Error('Failed to load Stripe.js'));
          };
        });
        
        document.body.appendChild(stripeScript);
        await stripePromise;
        console.log('Successfully loaded Stripe.js');
        
        // Then load Crypto Onramp
        const onrampScript = document.createElement('script');
        onrampScript.src = 'https://crypto-js.stripe.com/crypto-onramp-outer.js';
        onrampScript.async = true;
        
        const onrampPromise = new Promise((resolve, reject) => {
          onrampScript.onload = resolve;
          onrampScript.onerror = (e) => {
            console.error('Failed to load Stripe Crypto Onramp:', e);
            reject(new Error('Failed to load Stripe Crypto Onramp'));
          };
        });
        
        document.body.appendChild(onrampScript);
        await onrampPromise;
        console.log('Successfully loaded Stripe Crypto Onramp');
        
      } catch (err: any) {
        console.error("Failed to load Stripe scripts:", err);
        setError(err.message || 'Failed to load Stripe scripts');
        toast.error('Failed to load payment scripts');
      } finally {
        setIsLoadingScript(false);
      }
    };
    
    loadScripts();
    
    // Cleanup on unmount
    return () => {
      if (window.stripeOnrampInstance) {
        try {
          window.stripeOnrampInstance = null;
        } catch (e) {
          console.error('Error cleaning up Stripe Onramp:', e);
        }
      }
    };
  }, [apiKeyMissing]);
  
  const initializeOnrampWidget = async () => {
    if (!onrampElementRef.current) return;
    
    if (!window.StripeOnramp) {
      setError('Stripe scripts failed to load. Please refresh the page and try again.');
      return;
    }
    
    try {
      setIsLoadingWidget(true);
      setError(null);

      const result = await onInitiateOnramp();
      
      if (!result.success || !result.clientSecret) {
        if (result.error) {
          throw new Error(result.error);
        }
        throw new Error('Failed to initialize payment session');
      }
      
      // Store session data with timestamp
      setSessionData({
        sessionId: result.sessionId,
        clientSecret: result.clientSecret,
        timestamp: Date.now(),
        amount
      });
      
      // Get Stripe publishable key
      const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_CRYPTO;
      if (!stripePublishableKey) {
        throw new Error('Missing Stripe publishable key');
      }
      
      // Clean up any existing instance
      if (window.stripeOnrampInstance) {
        try {
          delete window.stripeOnrampInstance;
        } catch (e) {
          console.warn('Error cleaning up old Stripe instance:', e);
        }
      }
      
      // Initialize the widget
      const stripeOnramp = window.StripeOnramp(stripePublishableKey);
      
      // Store instance for potential cleanup
      window.stripeOnrampInstance = stripeOnramp;
      
      const onrampSession = await stripeOnramp.createSession({
        clientSecret: result.clientSecret,
        appearance: { 
          theme: 'light',
          variables: {
            colorPrimary: '#0047AB', // CSi blue color
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }
        },
        onComplete: () => {
          toast.success("Crypto purchase complete", {
            description: "Your transaction has been processed successfully."
          });
          
          // Clear the session data on completion
          setSessionData(null);
        },
        onError: (error: any) => {
          console.error('Onramp error:', error);
          toast.error('Payment error', {
            description: error.message || 'An error occurred during payment processing'
          });
        }
      });
      
      // Mount the widget to the DOM
      onrampSession.mount(onrampElementRef.current);
      
    } catch (err: any) {
      console.error('Error initializing Stripe Onramp:', err);
      setError(err.message || 'Failed to initialize payment');
      toast.error('Payment initialization failed', {
        description: err.message || 'Please try again or contact support'
      });
      
      // Clear session data on error
      setSessionData(null);
    } finally {
      setIsLoadingWidget(false);
    }
  };
  
  const handleOnrampButtonClick = () => {
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
    
    initializeOnrampWidget();
  };

  const resetSession = () => {
    setSessionData(null);
    setError(null);
    
    // Clean up any existing Stripe instance
    if (window.stripeOnrampInstance) {
      try {
        delete window.stripeOnrampInstance;
      } catch (e) {
        console.warn('Error cleaning up Stripe instance:', e);
      }
    }
    
    toast.success("Session reset successfully", {
      description: "You can now start a new payment session"
    });
  };

  // Check if environment has Stripe publishable key
  const missingStripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_CRYPTO ? false : true;

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
                <strong>Administrator note:</strong> Please configure VITE_STRIPE_PUBLISHABLE_KEY_CRYPTO in your environment variables.
              </div>
            )}
            {/* Add reset button when there's an error and session data exists */}
            {sessionData && (
              <Button 
                variant="outline" 
                size="sm" 
                className="self-start mt-1"
                onClick={resetSession}
              >
                Reset Session
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Widget container */}
      <div className="bg-white rounded-lg border border-gray-200">
        {!sessionData ? (
          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">Total amount:</p>
              <p className="text-lg font-medium text-gray-800">${amount.toLocaleString()}</p>
            </div>
            <Button 
              onClick={handleOnrampButtonClick} 
              disabled={isProcessing || isWalletMissing || isLoadingScript || isLoadingWidget || apiKeyMissing}
              className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white py-2 px-4 sm:w-auto w-full"
            >
              {isLoadingScript || isLoadingWidget ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLoadingScript ? 'Loading...' : 'Initializing...'}
                </>
              ) : (
                "Buy Crypto"
              )}
            </Button>
          </div>
        ) : (
          <>
            <div id="onramp-element" ref={onrampElementRef} className="min-h-[500px] w-full">
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-cbis-blue" />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={resetSession}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel Payment
              </Button>
            </div>
          </>
        )}
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
