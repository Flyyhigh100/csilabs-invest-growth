
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
    
    console.log("🔄 Setting up realtime subscription for KYC verification updates for user:", userId);
    
    // Create a unique channel ID to prevent conflicts
    const channelId = `kyc-status-changes-${userId}-${Date.now()}`;
    console.log(`Creating channel: ${channelId}`);
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'kyc_verifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📣 KYC verification update received:', payload);
          
          // Force refetch immediately
          try {
            console.log('🔄 Forcing KYC data refresh after realtime update');
            queryClient.invalidateQueries({ queryKey: ['kyc', userId] });
            
            // Double refetch with a delay to ensure we get the latest data
            setTimeout(() => {
              console.log('🔄 Delayed refetch for KYC data');
              queryClient.invalidateQueries({ queryKey: ['kyc', userId] });
              refetch();
              
              // Log the current state after refetch
              setTimeout(async () => {
                try {
                  const { data } = await supabase
                    .from('kyc_verifications')
                    .select('status')
                    .eq('user_id', userId)
                    .single();
                    
                  console.log('📊 Status after delayed refetch:', data?.status);
                } catch (error) {
                  console.error('Error checking status:', error);
                }
              }, 500);
            }, 1000);
            
            // Show appropriate notification based on the new status
            const newStatus = (payload.new as any)?.status;
            const oldStatus = (payload.old as any)?.status;
            
            console.log(`Status change: ${oldStatus} -> ${newStatus}`);
            
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
            } else if (newStatus === 'pending' && oldStatus !== 'pending') {
              toast.success('Your KYC verification has been submitted successfully!', {
                duration: 8000
              });
            }
          } catch (error) {
            console.error('❌ Error handling KYC realtime update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to KYC updates');
        } else {
          console.error('❌ Issue with realtime subscription:', status);
        }
      });
    
    // Force an immediate refetch when subscription is set up
    refetch();
    
    return () => {
      console.log('🧹 Cleaning up KYC realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, refetch]);
}
