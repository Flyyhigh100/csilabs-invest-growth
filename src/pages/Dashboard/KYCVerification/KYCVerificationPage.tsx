
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
  
  // Set up realtime subscription for KYC status updates
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('Setting up KYC realtime subscription for user:', user.id);
    
    // Set up realtime subscription for KYC status updates
    const channel = supabase
      .channel('kyc-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'kyc_verifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newPayload = payload.new as Record<string, any>;
          const oldPayload = payload.old as Record<string, any>;
          
          console.log('KYC verification updated:', payload);
          
          // Check if the payload has the expected structure and properties
          if (newPayload && oldPayload && 'status' in newPayload && 'status' in oldPayload) {
            // Get the new status from the payload
            const newStatus = newPayload.status;
            const oldStatus = oldPayload.status;
            
            if (newStatus && newStatus !== oldStatus) {
              // Show a toast notification based on the new status
              if (newStatus === 'approved') {
                toast.success('Your KYC verification has been approved!');
              } else if (newStatus === 'rejected') {
                toast.error('Your KYC verification has been rejected. Please check for details.');
              } else if (newStatus === 'needs_clarification') {
                toast.info('Additional information is required for your KYC verification.');
              } else if (newStatus === 'pending') {
                toast.info('Your KYC verification has been submitted and is pending review.');
              }
              
              // Refetch KYC data to get the latest status
              refetch();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        
        if (status === 'SUBSCRIBED') {
          console.log("✅ Successfully subscribed to KYC updates");
        } else {
          console.error("❌ Failed to subscribe to KYC updates");
        }
      });
      
    // Force a refetch when component mounts to ensure fresh data
    refetch();
    
    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
      console.log("Unsubscribed from KYC updates");
    };
  }, [user?.id, refetch]);

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
