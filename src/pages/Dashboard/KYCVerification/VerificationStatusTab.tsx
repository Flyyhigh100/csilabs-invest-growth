
import React from 'react';
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
    </div>
  );
};

export default VerificationStatusTab;
