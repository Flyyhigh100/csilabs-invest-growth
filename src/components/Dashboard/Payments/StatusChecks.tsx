
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const PaymentStatusCheck: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [alreadyNotified, setAlreadyNotified] = useState(false);
  
  useEffect(() => {
    // Check if we've already shown a notification to prevent duplicates
    if (alreadyNotified) {
      return;
    }
    
    // Check for payment status in URL
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      // Show a single success message with more details
      toast.success("Payment successful!", {
        description: "Your tokens will be sent to your wallet shortly.",
        duration: 5000, // Show for 5 seconds
        id: "payment-success", // Use an ID to prevent duplicate toasts
      });
      setAlreadyNotified(true);
      
      // Store in session storage to prevent repeated notifications if the page reloads
      sessionStorage.setItem('payment_notification_shown', 'true');
    } else if (canceled === 'true') {
      toast.error("Payment was canceled.", {
        description: "No charges were made to your account.",
        duration: 5000,
        id: "payment-canceled"
      });
      setAlreadyNotified(true);
      sessionStorage.setItem('payment_notification_shown', 'true');
    }
  }, [searchParams, alreadyNotified]);
  
  // Check session storage on component mount
  useEffect(() => {
    const notificationShown = sessionStorage.getItem('payment_notification_shown');
    if (notificationShown) {
      setAlreadyNotified(true);
    }
    
    // Clear the notification flag when component unmounts
    return () => {
      sessionStorage.removeItem('payment_notification_shown');
    };
  }, []);
  
  // This is just a wrapper component, so it doesn't render anything
  return null;
};
