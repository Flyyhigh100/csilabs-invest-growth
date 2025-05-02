
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePaymentValidation } from './usePaymentValidation';
import { StripeCryptoOnrampResult } from './types';

export const useStripeCryptoOnramp = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { validatePaymentRequest } = usePaymentValidation(walletAddress);

  const createOnrampSession = async (amount: number, currentTokenPrice?: number): Promise<StripeCryptoOnrampResult> => {
    if (!validatePaymentRequest(amount)) return { success: false };
    
    setIsProcessing(true);
    
    try {
      console.log(`Creating Stripe Onramp session for $${amount} to wallet ${walletAddress}`);
      console.log(`Current token price: ${currentTokenPrice || 'not provided'}`);
      
      // Get the current auth session token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Authentication required", { 
          description: "You must be logged in to make a payment."
        });
        setIsProcessing(false);
        return { success: false, error: "Authentication required" };
      }
      
      console.log("Invoking create-stripe-onramp-session function...");
      const { data, error } = await supabase.functions.invoke('create-stripe-onramp-session', {
        body: { 
          amount, 
          walletAddress,
          tokenPrice: currentTokenPrice
        }
      });
      
      if (error) {
        console.error("Stripe onramp error:", error);
        let errorMessage = error.message || "Please try again or contact support.";
        let errorDetails = null;
        let suggestion = null;
        
        // Check if error has additional details
        if (error.context && typeof error.context === 'object') {
          errorDetails = JSON.stringify(error.context);
        }
        
        setIsProcessing(false);
        return { 
          success: false, 
          error: errorMessage,
          details: errorDetails,
          suggestion 
        };
      }
      
      // Check if we received a valid response from the edge function
      if (!data) {
        console.error("Received empty response from Stripe onramp endpoint");
        setIsProcessing(false);
        return { 
          success: false, 
          error: "Empty response from server", 
          details: "The server returned an empty response. Please contact support." 
        };
      }

      // Check if we have redirect_url for redirect
      if (!data.redirect_url) {
        console.error("No redirect URL received from Stripe", data);
        setIsProcessing(false);
        return { 
          success: false, 
          error: "No redirect URL received. Please try again.",
          details: data ? JSON.stringify(data) : null
        };
      }
      
      console.log("Received successful Stripe onramp session response:", {
        hasRedirectUrl: !!data.redirect_url,
        sessionId: !!data.session_id
      });
      
      toast.success("Initializing crypto purchase...");
      console.log("🌐 redirecting...");
      
      return { 
        success: true, 
        redirect_url: data.redirect_url,
        session_id: data.session_id 
      };
    } catch (error: any) {
      console.error("Error creating Stripe onramp session:", error);
      
      // Try to extract more details from the error
      let errorMessage = "Please try again or contact support.";
      let errorDetails = null;
      let suggestion = null;
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.response) {
        try {
          const responseData = await error.response.json();
          if (responseData.error) {
            errorMessage = responseData.error;
          }
          if (responseData.details) {
            errorDetails = responseData.details;
          }
          if (responseData.suggestion) {
            suggestion = responseData.suggestion;
          }
        } catch (e) {
          // Could not parse JSON from response
          console.error("Could not parse error response:", e);
        }
      }
      
      setIsProcessing(false);
      return { 
        success: false, 
        error: errorMessage,
        details: errorDetails || error.stack,
        suggestion
      };
    } finally {
      if (isProcessing) {
        setIsProcessing(false);
      }
    }
  };

  return {
    createOnrampSession,
    isProcessing,
    setIsProcessing
  };
};
