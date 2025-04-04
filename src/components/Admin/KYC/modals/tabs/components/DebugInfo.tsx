
import React from 'react';
import { KycVerificationWithProfile } from '@/components/Admin/KYC/types';

interface DebugInfoProps {
  kyc: KycVerificationWithProfile;
  processedUrls?: {
    idFront: string | null;
    idBack: string | null;
    selfie: string | null;
  };
}

const DebugInfo: React.FC<DebugInfoProps> = () => {
  // Debug component is now empty - not displaying any debug info in production
  return null;
};

export default DebugInfo;
