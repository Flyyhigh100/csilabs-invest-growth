
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
        return { success: false };
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
        toast.error("Payment session failed", { 
          description: error.message || "Please try again or contact support." 
        });
        setIsProcessing(false);
        return { success: false };
      }
      
      if (!data?.redirect_url) {
        console.error("No redirect URL received from Stripe");
        toast.error("Payment session failed", {
          description: "No session data received. Please try again."
        });
        setIsProcessing(false);
        return { success: false };
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
      toast.error("Payment session failed", {
        description: error.message || "Please try again or contact support."
      });
      setIsProcessing(false);
      return { success: false };
    }
  };

  return {
    createOnrampSession,
    isProcessing,
    setIsProcessing
  };
};
