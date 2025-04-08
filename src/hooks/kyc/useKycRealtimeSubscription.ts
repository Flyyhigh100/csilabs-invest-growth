
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for setting up real-time subscriptions for KYC verification status updates
 */
export function useKycRealtimeSubscription(userId: string | undefined, refetch: () => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    
    console.log("Setting up realtime subscription for KYC verification updates");
    
    const channel = supabase
      .channel('kyc-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'kyc_verifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('KYC verification update received:', payload);
          
          // Force refetch immediately
          try {
            console.log('Forcing KYC data refresh after realtime update');
            queryClient.invalidateQueries({ queryKey: ['kyc', userId] });
            
            // Double refetch with a delay to ensure we get the latest data
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['kyc', userId] });
              refetch();
            }, 500);
            
            // Show appropriate notification based on the new status
            const newStatus = (payload.new as any)?.status;
            
            if (newStatus === 'approved') {
              toast.success('Your KYC verification has been approved!', {
                duration: 8000
              });
            } else if (newStatus === 'rejected') {
              toast.error('Your KYC verification has been rejected. Please check the details.', {
                duration: 8000
              });
            } else if (newStatus === 'needs_clarification') {
              toast.info('Additional information is required for your KYC verification.', {
                duration: 8000
              });
            } else if (newStatus === 'pending') {
              toast.success('Your KYC verification has been submitted successfully!', {
                duration: 8000
              });
            }
          } catch (error) {
            console.error('Error handling KYC realtime update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });
    
    // Force an immediate refetch when subscription is set up
    refetch();
    
    return () => {
      console.log('Cleaning up KYC realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, refetch]);
}
