
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
      console.log(`Creating Stripe checkout for $${amount} to wallet ${walletAddress}`);
      
      // Get the current auth session token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Authentication required", { 
          description: "You must be logged in to make a payment."
        });
        setIsProcessing(false);
        return;
      }
      
      console.log("Invoking create-stripe-checkout function...");
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { amount, walletAddress }
      });
      
      if (error) {
        console.error("Stripe checkout error:", error);
        toast.error("Payment session failed", { 
          description: error.message || "Please try again or contact support." 
        });
        setIsProcessing(false);
        return;
      }
      
      if (!data?.url) {
        console.error("No checkout URL received from Stripe");
        toast.error("Payment session failed", {
          description: "No checkout URL received. Please try again."
        });
        setIsProcessing(false);
        return;
      }
      
      console.log("Received Stripe checkout URL:", data.url);
      toast.success("Redirecting to Stripe checkout...", {
        description: "For testing, use card 4242 4242 4242 4242, any future date, and any CVC."
      });
      
      // Store session information in localStorage before redirecting
      if (data.session_id) {
        // Save current auth session ID and timestamp to help recover auth state
        const sessionObject = {
          session_id: data.session_id,
          payment_intent: data.payment_intent || null,
          user_id: data.user_id,
          timestamp: Date.now(),
          auth_refresh_token: sessionData.session?.refresh_token || null
        };
        
        localStorage.setItem('stripe_session_data', JSON.stringify(sessionObject));
        console.log("Saved session data to localStorage before redirect");
      }
      
      // Multiple redirection approaches
      try {
        console.log("Attempting primary redirection method to:", data.url);
        
        // Primary method: direct location change
        window.location.assign(data.url);
        
        // Set a timer to check if redirection worked
        setTimeout(() => {
          console.log("Checking if redirection occurred...");
          
          // If we're still here, try a different approach
          try {
            console.log("Attempting secondary redirection method (open in new tab)");
            window.open(data.url, '_blank');
            
            // Show a toast with a manual link as last resort
            toast.info("Click below if you weren't redirected", {
              duration: 10000,
              action: {
                label: "Open Checkout",
                onClick: () => window.open(data.url, '_blank')
              }
            });
          } catch (err) {
            console.error("Error with fallback redirection:", err);
            
            // Final fallback: Just show a toast with the link
            toast.info("Click to continue to payment", {
              duration: 15000,
              action: {
                label: "Open Checkout",
                onClick: () => window.open(data.url, '_blank')
              }
            });
          }
          
          // Reset processing state if we're still here
          setIsProcessing(false);
        }, 3000);
        
      } catch (err) {
        console.error("Error during redirection:", err);
        toast.error("Redirect failed", {
          description: "Please click the link to continue to payment.",
          action: {
            label: "Open Checkout",
            onClick: () => window.open(data.url, '_blank')
          }
        });
        setIsProcessing(false);
      }
      
    } catch (error: any) {
      console.error("Error creating Stripe checkout:", error);
      toast.error("Payment session failed", {
        description: error.message || "Please try again or contact support."
      });
      setIsProcessing(false);
    }
  };

  return {
    handleStripePayment,
    isProcessing,
    setIsProcessing
  };
};
