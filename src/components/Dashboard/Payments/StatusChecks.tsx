
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const PaymentStatusCheck: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Check for payment status in URL
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast.success("Payment successful! Your tokens will be sent to your wallet shortly.");
    } else if (canceled === 'true') {
      toast.error("Payment was canceled. No charges were made.");
    }
  }, [searchParams]);
  
  // This is just a wrapper component, so it doesn't render anything
  return null;
};
