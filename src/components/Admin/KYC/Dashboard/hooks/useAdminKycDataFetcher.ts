
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchKycVerifications, 
  listAllUsersWithKycStatus, 
  verifyAdminAccess 
} from '../../KycVerificationsService';
import { KycVerificationWithProfile } from '../../types';

export const useAdminKycDataFetcher = (isAdmin: boolean | null) => {
  // State for controlling view
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  
  // Fetch KYC verifications
  const { 
    data: kycVerifications = [], 
    isLoading: isKycLoading, 
    error: kycError,
    refetch: refetchKyc
  } = useQuery({
    queryKey: ['admin-kyc-verifications', manualRefreshCount],
    queryFn: fetchKycVerifications,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    enabled: isAdmin === true,
  });
  
  // Fetch all users with KYC status
  const { 
    data: allUsersWithKyc = [], 
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers 
  } = useQuery({
    queryKey: ['admin-all-users-kyc', manualRefreshCount],
    queryFn: listAllUsersWithKycStatus,
    enabled: isAdmin === true,
  });
  
  // Merge regular KYC verifications with all users for complete list
  const mergedKycVerifications: KycVerificationWithProfile[] = showAllUsers 
    ? allUsersWithKyc.map(user => ({
        id: user.kyc_id || user.id,
        user_id: user.id,
        profile_first_name: user.first_name,
        profile_last_name: user.last_name,
        status: user.kyc_status || 'not_started',
        submitted_at: user.submitted_at,
        reviewed_at: user.reviewed_at,
        // Include all other KYC fields with default values
        first_name: null,
        last_name: null,
        date_of_birth: null,
        nationality: null,
        address: null,
        city: null,
        postal_code: null,
        country: null,
        id_front_url: null,
        id_back_url: null,
        selfie_url: null,
        rejection_reason: null,
        clarification_message: null,
        created_at: user.created_at,
        updated_at: user.updated_at,
        ...user.kyc_record
      }))
    : kycVerifications;
  
  // Handle manual refresh
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    setManualRefreshCount(prev => prev + 1);
    
    // Check admin access first
    const adminAccess = await verifyAdminAccess();
    if (!adminAccess) {
      toast.error('You do not have admin permissions to view KYC verifications');
      return;
    }
    
    // Standard refetch
    refetchKyc();
    refetchUsers();
    toast.success('Refreshing KYC data...');
  };
  
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
          refetchKyc();
          refetchUsers();
          
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
  }, [isAdmin, refetchKyc, refetchUsers]);
  
  return {
    kycVerifications: mergedKycVerifications,
    isLoading: isKycLoading || isUsersLoading,
    error: kycError || usersError,
    showAllUsers,
    setShowAllUsers,
    allUsersWithKyc,
    handleManualRefresh,
    refetch: () => {
      refetchKyc();
      refetchUsers();
    },
    realtimeEnabled,
    manualRefreshCount
  };
};
