
import { useCallback, useEffect } from 'react';
import { VerificationOptions } from './types';

/**
 * Hook to check and handle stored Stripe session data
 */
export const useStoredDataCheck = (
  options: VerificationOptions,
  checkStoredTransaction: (id: string) => Promise<void>
) => {
  const { success, sessionId } = options;

  // Function to check for stored Stripe session data
  const checkStoredStripeData = useCallback(() => {
    const stripeData = localStorage.getItem('stripe_session_data');
    if (!stripeData) return;

    try {
      const data = JSON.parse(stripeData);
      console.log("Found Stripe session data in localStorage:", {
        session_id: data.session_id,
        payment_intent: data.payment_intent,
        timestamp: new Date(data.timestamp).toISOString(),
        amount: data.amount,
        wallet_address: data.wallet_address
      });
      
      // If we returned from Stripe with success but no transaction found,
      // we could use this data to recover and verify the transaction
      if (success === 'true' && !sessionId && data.session_id) {
        console.log("Success param without session_id, using stored session:", data.session_id);
        checkStoredTransaction(data.session_id);
      }
    } catch (e) {
      console.error("Error parsing Stripe session data:", e);
    }
  }, [success, sessionId, checkStoredTransaction]);

  // Effect to check stored Stripe data
  useEffect(() => {
    checkStoredStripeData();
  }, [checkStoredStripeData]);

  return { checkStoredStripeData };
};
