
import React from 'react';
import { KycVerificationWithProfile } from '@/components/Admin/KYC/types';

interface DebugInfoProps {
  kyc: KycVerificationWithProfile;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ kyc }) => {
  // Only render in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info (Dev Only)</h4>
      <div className="space-y-2 text-xs text-gray-500">
        <p><strong>ID Front URL:</strong> {kyc.id_front_url || 'None'}</p>
        <p><strong>ID Back URL:</strong> {kyc.id_back_url || 'None'}</p>
        <p><strong>Selfie URL:</strong> {kyc.selfie_url || 'None'}</p>
      </div>
    </div>
  );
};

export default DebugInfo;
