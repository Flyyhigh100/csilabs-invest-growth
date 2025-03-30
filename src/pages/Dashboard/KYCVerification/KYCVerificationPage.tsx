
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import KYCTabs from './KYCTabs';

const KYCVerificationPage = () => {
  const { user } = useAuth();
  const {
    kycData,
    isLoading,
    refetch
  } = useKycVerification();
  
  // Force a refetch when component mounts to ensure fresh data
  useEffect(() => {
    console.log("KYCVerification component mounted, fetching fresh data");
    refetch();
  }, [refetch]);

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
