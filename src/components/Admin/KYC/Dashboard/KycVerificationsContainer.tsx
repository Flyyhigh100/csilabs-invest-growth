
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import KycVerificationsTabs from '../KycVerificationsTabs';
import { KycVerificationWithProfile } from '../types';

interface KycVerificationsContainerProps {
  kycVerifications: KycVerificationWithProfile[];
  isLoading: boolean;
  error: Error | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onViewDetails: (kyc: KycVerificationWithProfile) => void;
  refetch: () => void;
}

const KycVerificationsContainer: React.FC<KycVerificationsContainerProps> = ({
  kycVerifications,
  isLoading,
  error,
  activeTab,
  setActiveTab,
  onViewDetails,
  refetch
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error loading KYC verifications</h3>
        <p>{error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verification Requests</CardTitle>
        <CardDescription>
          Review and process KYC verification requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <KycVerificationsTabs
          kycVerifications={kycVerifications}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onViewDetails={onViewDetails}
        />
      </CardContent>
    </Card>
  );
};

export default KycVerificationsContainer;
