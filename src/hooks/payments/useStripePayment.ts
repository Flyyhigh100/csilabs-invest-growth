
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePaymentValidation } from './usePaymentValidation';

export const useStripePayment = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { validatePaymentRequest } = usePaymentValidation(walletAddress);

  const handleStripePayment = async (amount: number) => {
    if (!validatePaymentRequest(amount)) return;
    
    setIsProcessing(true);
    
    try {
      const toastId = "stripe-preparing";
      toast.info("Preparing payment session...", { id: toastId });
      
      console.log(`Creating Stripe checkout for $${amount} to wallet ${walletAddress}`);
      
      // Get the current auth session token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Authentication required", { 
          description: "You must be logged in to make a payment."
        });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { amount, walletAddress }
      });
      
      if (error) {
        console.error("Stripe checkout error:", error);
        toast.dismiss(toastId);
        throw new Error(error.message || "Failed to create payment session");
      }
      
      if (data?.url) {
        toast.dismiss(toastId);
        toast.info("Redirecting to Stripe checkout...", {
          description: "For testing, use card 4242 4242 4242 4242, any future date, and any CVC."
        });
        
        // Store session information in localStorage before redirecting
        if (data.session_id && data.user_id) {
          // Save current auth session ID and timestamp to help recover auth state
          const sessionObject = {
            session_id: data.session_id,
            payment_intent: data.payment_intent || null,
            user_id: data.user_id,
            timestamp: Date.now(),
            auth_refresh_token: sessionData.session?.refresh_token || null
          };
          
          localStorage.setItem('stripe_session_data', JSON.stringify(sessionObject));
          console.log("Saved session data to localStorage before redirect:", { 
            session_id: data.session_id,
            payment_intent: data.payment_intent,
            timestamp: Date.now() 
          });
        }
        
        console.log("Redirecting to Stripe checkout URL:", data.url);
        
        // Enhanced redirect with fallback mechanism
        try {
          // Primary method: direct location change
          window.location.href = data.url;
          
          // Fallback: If the above doesn't trigger within 1 second, try opening in a new tab
          setTimeout(() => {
            console.log("Attempting fallback redirect...");
            window.open(data.url, '_blank');
          }, 1000);
        } catch (redirectError) {
          console.error("Redirect error, trying fallback:", redirectError);
          // If direct redirect fails, try opening in a new tab
          window.open(data.url, '_blank');
        }
      } else {
        toast.dismiss(toastId);
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Error creating Stripe checkout:", error);
      toast.error("Payment session failed", {
        description: error.message || "Please try again or contact support."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleStripePayment,
    isProcessing,
    setIsProcessing
  };
};
