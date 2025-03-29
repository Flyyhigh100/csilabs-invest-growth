
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import VerificationStatus from '@/components/KYC/VerificationStatus';
import { KycVerificationData } from '@/hooks/kyc/types';

interface VerificationStatusTabProps {
  kycData: KycVerificationData | null;
  onStartVerification: () => void;
}

const VerificationStatusTab: React.FC<VerificationStatusTabProps> = ({
  kycData,
  onStartVerification
}) => {
  return (
    <TabsContent value="verification-status" className="py-4">
      <VerificationStatus 
        status={kycData?.status || 'not_started'}
        rejectionReason={kycData?.rejection_reason}
        onStartVerification={onStartVerification}
      />
    </TabsContent>
  );
};

export default VerificationStatusTab;
