
import { useState } from 'react';
import { loadStripeOnrampScripts } from '@/lib/loadStripeOnramp';
import { StripeCryptoOnrampResult } from './types';

// Hook for handling Stripe Crypto Onramp payments
export const useStripeCryptoOnramp = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Make sure Stripe scripts are loaded
  const ensureScriptsLoaded = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.StripeOnramp) {
        resolve(true);
        return;
      }
      
      // Load scripts if not already loaded
      loadStripeOnrampScripts();
      
      // Check every 100ms for up to 5 seconds if scripts are loaded
      let attempts = 0;
      const checkInterval = setInterval(() => {
        if (window.StripeOnramp) {
          clearInterval(checkInterval);
          resolve(true);
          return;
        }
        
        attempts++;
        if (attempts >= 50) {  // 5 seconds
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  };

  // Create an onramp session directly in the browser
  const createOnrampSession = async (
    amount: number,
    currentTokenPrice?: number
  ): Promise<StripeCryptoOnrampResult> => {
    try {
      setIsProcessing(true);
      
      // Ensure wallet address is available
      if (!walletAddress) {
        return {
          success: false,
          error: "Wallet address required",
          details: "You need to add a wallet address to receive your tokens."
        };
      }
      
      // Ensure Stripe scripts are loaded
      const scriptsLoaded = await ensureScriptsLoaded();
      if (!scriptsLoaded) {
        return {
          success: false,
          error: "Failed to load Stripe scripts",
          details: "Could not initialize Stripe Crypto Onramp. Please refresh the page and try again."
        };
      }

      // Use Stripe's client-side onramp with destination wallet
      return {
        success: true,
        client_side: true
      };
    } catch (error) {
      console.error("Error in Stripe Crypto Onramp:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        details: "An unexpected error occurred while setting up the crypto purchase."
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return { 
    createOnrampSession, 
    isProcessing, 
    setIsProcessing 
  };
};
