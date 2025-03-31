
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

const DebugInfo: React.FC<DebugInfoProps> = ({ kyc, processedUrls }) => {
  // Only render in development environment or if explicitly enabled
  const isDevelopment = typeof window !== 'undefined' && 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('dev') ||
    window.location.hostname.includes('preview');

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info (Dev Only)</h4>
      <div className="space-y-2 text-xs text-gray-500">
        <p><strong>Original ID Front URL:</strong> {kyc.id_front_url || 'None'}</p>
        <p><strong>Original ID Back URL:</strong> {kyc.id_back_url || 'None'}</p>
        <p><strong>Original Selfie URL:</strong> {kyc.selfie_url || 'None'}</p>
        
        {processedUrls && (
          <>
            <hr className="my-2" />
            <p><strong>Processed ID Front URL:</strong> {processedUrls.idFront || 'None'}</p>
            <p><strong>Processed ID Back URL:</strong> {processedUrls.idBack || 'None'}</p>
            <p><strong>Processed Selfie URL:</strong> {processedUrls.selfie || 'None'}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DebugInfo;
