
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for setting up realtime subscription for KYC verifications
 */
export const useKycRealtimeUpdates = (isAdmin: boolean | null, refetch: () => void) => {
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  
  // Set up realtime subscription
  useEffect(() => {
    // Only set up if admin
    if (!isAdmin) return;
    
    // Set up realtime subscription for KYC verifications
    console.log('Setting up realtime subscription for kyc_verifications table...');
    const channel = supabase
      .channel('kyc-verification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_verifications'
        },
        (payload) => {
          console.log('Realtime update received for kyc_verifications:', payload);
          setRealtimeEnabled(true);
          
          // Always refetch when we get an update
          refetch();
          
          // Show informative toast notification
          const eventType = payload.eventType;
          
          if (eventType === 'INSERT') {
            toast.info('New KYC verification submitted');
          } else if (eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            
            if (newRecord.status && newRecord.status !== oldRecord.status) {
              const statusMap: Record<string, string> = {
                'approved': 'Approved',
                'rejected': 'Rejected',
                'pending': 'Pending',
                'needs_clarification': 'Needs clarification'
              };
              
              const statusText = statusMap[newRecord.status] || newRecord.status;
              toast.info(`KYC verification updated: ${statusText}`);
            } else {
              toast.info('KYC verification updated');
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setRealtimeEnabled(true);
        } else if (status === 'CHANNEL_ERROR') {
          setRealtimeEnabled(false);
          console.error('Failed to subscribe to realtime updates');
        }
      });
    
    // Clean up subscription when component unmounts
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [isAdmin, refetch]);
  
  return { realtimeEnabled };
};
