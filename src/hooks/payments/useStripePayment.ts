
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
      toast.info("Preparing payment session...", {
        id: "stripe-preparing"
      });
      
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { amount, walletAddress }
      });
      
      if (error) {
        console.error("Stripe checkout error:", error);
        toast.dismiss("stripe-preparing");
        throw new Error(error.message || "Failed to create payment session");
      }
      
      if (data?.url) {
        toast.dismiss("stripe-preparing");
        toast.info("Redirecting to Stripe checkout...", {
          description: "You will be redirected to complete your payment securely."
        });
        
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.dismiss("stripe-preparing");
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
