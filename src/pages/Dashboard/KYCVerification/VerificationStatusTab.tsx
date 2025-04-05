
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { KycVerificationData } from '@/hooks/kyc/types';
import VerificationStatus from '@/components/KYC/VerificationStatus';

interface VerificationStatusTabProps {
  kycData: KycVerificationData | null;
  isLoading: boolean;
  onStartVerification: () => void;
  onProvideMoreInfo?: () => void;
}

const VerificationStatusTab: React.FC<VerificationStatusTabProps> = ({
  kycData,
  isLoading,
  onStartVerification,
  onProvideMoreInfo
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div>
      <VerificationStatus
        status={kycData?.status || 'not_started'}
        rejectionReason={kycData?.rejection_reason}
        clarificationMessage={kycData?.clarification_message}
        onStartVerification={onStartVerification}
        onProvideMoreInfo={onProvideMoreInfo}
      />
      
      {/* Show detailed status info for debugging (in development only) */}
      {process.env.NODE_ENV === 'development' && kycData && (
        <Alert className="mt-8">
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription>
            <div className="text-xs font-mono break-words whitespace-pre-wrap mt-2">
              {JSON.stringify(kycData, null, 2)}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VerificationStatusTab;
