
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import KYCTabs from './KYCTabs';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import KycStatusTester from './TestHelpers/KycStatusTester';

const KYCVerificationPage = () => {
  const { user } = useAuth();
  const {
    kycData,
    isLoading,
    refetch
  } = useKycVerification();
  
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [manuallyRefreshing, setManuallyRefreshing] = useState(false);
  
  const handleManualRefresh = async () => {
    setManuallyRefreshing(true);
    toast.info("Manually refreshing KYC data...");
    
    try {
      await refetch();
      setLastRefresh(new Date());
      toast.success("KYC data refreshed");
    } catch (error) {
      console.error("Error refreshing KYC data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setManuallyRefreshing(false);
    }
  };
  
  // Debug data fetching on mount
  useEffect(() => {
    console.log("🚀 KYC Verification Page mounted");
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    console.log("🔍 Current KYC data:", kycData);
  }, [kycData]);

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
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Identity Verification</h1>
          <p className="text-gray-500 text-sm">
            Complete the verification process to unlock full platform access.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={manuallyRefreshing}
        >
          {manuallyRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Refresh Data
        </Button>
      </div>
      
      {/* Debug Info */}
      <Card className="mb-6 bg-gray-50 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-1">
            <div><strong>User ID:</strong> {user?.id || 'Not logged in'}</div>
            <div><strong>Current Status:</strong> {kycData?.status || 'unknown'}</div>
            <div><strong>Submitted At:</strong> {kycData?.submitted_at ? new Date(kycData.submitted_at).toLocaleString() : 'Not submitted'}</div>
            <div><strong>Last Refreshed:</strong> {lastRefresh ? lastRefresh.toLocaleString() : 'Not manually refreshed'}</div>
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7 px-2"
                onClick={async () => {
                  if (!user?.id) {
                    toast.error("Not logged in");
                    return;
                  }
                  
                  try {
                    const { data, error } = await supabase
                      .from('kyc_verifications')
                      .select('*')
                      .eq('user_id', user.id)
                      .single();
                    
                    if (error) throw error;
                    console.log("🔍 Raw KYC data from direct query:", data);
                    toast.success("Raw data fetched to console");
                  } catch (error) {
                    console.error("Error fetching raw data:", error);
                    toast.error("Error fetching raw data");
                  }
                }}
              >
                Fetch Raw Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add the KYC status tester component */}
      <KycStatusTester 
        onRefresh={handleManualRefresh}
        currentStatus={kycData?.status}
      />
      
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Verification Steps</CardTitle>
          <CardDescription>
            Follow the steps below to complete your identity verification.
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
