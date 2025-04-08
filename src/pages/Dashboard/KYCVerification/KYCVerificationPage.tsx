
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import KYCTabs from './KYCTabs';
import { supabase } from '@/integrations/supabase/client';

const KYCVerificationPage = () => {
  const { user } = useAuth();
  const {
    kycData,
    isLoading,
    refetch
  } = useKycVerification();
  
  // State to track status changes
  const [lastStatus, setLastStatus] = useState(kycData?.status);
  
  // Track last refetch time to prevent too frequent refetches
  const [lastRefetchTime, setLastRefetchTime] = useState(0);
  
  // Helper function to perform refetch with rate limiting
  const performRefetch = () => {
    const now = Date.now();
    if (now - lastRefetchTime > 1000) { // Only refetch once per second at most
      console.log('🔄 Performing controlled refetch of KYC data');
      refetch();
      setLastRefetchTime(now);
    }
  };
  
  // Update lastStatus when kycData changes
  useEffect(() => {
    if (kycData?.status && kycData.status !== lastStatus) {
      console.log(`📊 KYC Status changed: ${lastStatus} -> ${kycData.status}`);
      setLastStatus(kycData.status);
      
      // Show toast notification for status changes
      if (kycData.status === 'pending') {
        toast.success('Your verification has been submitted for review!');
      } else if (kycData.status === 'approved') {
        toast.success('Your KYC verification has been approved!');
      } else if (kycData.status === 'rejected') {
        toast.error('Your KYC verification has been rejected. Please check for details.');
      } else if (kycData.status === 'needs_clarification') {
        toast.info('Additional information is required for your KYC verification.');
      }
    }
  }, [kycData?.status, lastStatus]);
  
  // Set up realtime subscription for KYC status updates
  useEffect(() => {
    if (!user?.id) return;
    
    console.log("🔌 Setting up realtime subscription for user:", user.id);
    
    // Immediate fetch on mount
    performRefetch();
    
    // Set up realtime subscription for KYC status updates
    const channel = supabase
      .channel(`kyc-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_verifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 KYC verification updated:', payload);
          
          // Type guard to ensure payload.new and payload.old exist and have status property
          const newStatus = payload.new && typeof payload.new === 'object' ? (payload.new as Record<string, any>).status : undefined;
          const oldStatus = payload.old && typeof payload.old === 'object' ? (payload.old as Record<string, any>).status : undefined;
          
          if (newStatus && newStatus !== oldStatus) {
            console.log(`📊 Status changed from ${oldStatus} to ${newStatus}`);
            
            // Show a toast notification based on the new status
            if (newStatus === 'approved') {
              toast.success('Your KYC verification has been approved!');
            } else if (newStatus === 'rejected') {
              toast.error('Your KYC verification has been rejected. Please check for details.');
            } else if (newStatus === 'needs_clarification') {
              toast.info('Additional information is required for your KYC verification.');
            } else if (newStatus === 'pending') {
              toast.success('Your verification has been submitted for review!');
            }
            
            // Refetch KYC data to get the latest status
            performRefetch();
          } else {
            console.log('🔄 Other KYC data updated, refetching');
            performRefetch();
          }
        }
      )
      .subscribe((status) => {
        console.log("🔌 Supabase subscription status:", status);
      });
    
    // Clean up subscription when component unmounts
    return () => {
      console.log("🔌 Cleaning up KYC subscription");
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (isLoading) {
    return (
      <DashboardLayout title="KYC Verification">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          <span className="ml-2 text-gray-600">Loading verification status...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="KYC Verification">
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
          <CardDescription>
            Complete the verification process to unlock full platform access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KYCTabs kycData={kycData} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default KYCVerificationPage;
