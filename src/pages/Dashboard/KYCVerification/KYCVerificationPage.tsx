
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import KYCTabs from './KYCTabs';
import { Button } from '@/components/ui/button';

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
    toast.info("Refreshing verification status...");
    
    try {
      await refetch();
      setLastRefresh(new Date());
      toast.success("Status updated");
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Identity Verification</h1>
        <p className="text-gray-500 text-sm">
          Complete the verification process to unlock full platform access.
        </p>
      </div>
      
      <div className="flex justify-end mb-4">
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
          Refresh Status
        </Button>
      </div>
      
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
