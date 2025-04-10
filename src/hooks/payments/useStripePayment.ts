
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
          description: "You will be redirected to complete your payment securely."
        });
        
        // Store session information in localStorage before redirecting
        // This will help us recover the session when the user returns
        if (data.session_id && data.user_id) {
          localStorage.setItem('stripe_session_data', JSON.stringify({
            session_id: data.session_id,
            user_id: data.user_id,
            timestamp: Date.now()
          }));
        }
        
        console.log("Redirecting to Stripe checkout URL:", data.url);
        
        // Redirect to Stripe checkout
        window.location.href = data.url;
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
