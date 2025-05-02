
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePaymentValidation } from './usePaymentValidation';

export const useStripeCryptoOnramp = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { validatePaymentRequest } = usePaymentValidation(walletAddress);

  const createOnrampSession = async (amount: number, currentTokenPrice?: number) => {
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
      
      console.log("Invoking create-stripe-onramp-redirect function...");
      const { data, error } = await supabase.functions.invoke('create-stripe-onramp-redirect', {
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
        
        // Check if error has additional details
        if (error.context && typeof error.context === 'object') {
          errorDetails = JSON.stringify(error.context);
        }
        
        setIsProcessing(false);
        return { 
          success: false, 
          error: errorMessage,
          details: errorDetails 
        };
      }
      
      if (!data?.redirect_url) {
        console.error("No redirect URL received from Stripe", data);
        setIsProcessing(false);
        return { 
          success: false, 
          error: "No session data received. Please try again.",
          details: data ? JSON.stringify(data) : null
        };
      }
      
      console.log("Received Stripe onramp redirect URL:", data.redirect_url);
      toast.success("Initializing crypto purchase...");
      
      return { 
        success: true, 
        redirect_url: data.redirect_url,
        sessionId: data.session_id 
      };
    } catch (error: any) {
      console.error("Error creating Stripe onramp session:", error);
      
      // Try to extract more details from the error
      let errorMessage = "Please try again or contact support.";
      let errorDetails = null;
      
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
        } catch (e) {
          // Could not parse JSON from response
          console.error("Could not parse error response:", e);
        }
      }
      
      setIsProcessing(false);
      return { 
        success: false, 
        error: errorMessage,
        details: errorDetails || error.stack
      };
    }
  };

  return {
    createOnrampSession,
    isProcessing,
    setIsProcessing
  };
};
