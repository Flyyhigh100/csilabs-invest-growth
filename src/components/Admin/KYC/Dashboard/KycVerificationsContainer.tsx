
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
      <div className="flex justify-center items-center h-40 md:h-64">
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-cbis-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error loading KYC verifications</h3>
        <p className="text-sm mb-3">{error.message}</p>
        <Button onClick={() => refetch()} size="sm" className="w-full sm:w-auto">
          <RefreshCw className="mr-2 h-3 w-3 md:h-4 md:w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl">KYC Verification Requests</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Review and process KYC verification requests
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-6 overflow-x-auto">
        <div className="min-w-full">
          <KycVerificationsTabs
            kycVerifications={kycVerifications}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onViewDetails={onViewDetails}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default KycVerificationsContainer;
