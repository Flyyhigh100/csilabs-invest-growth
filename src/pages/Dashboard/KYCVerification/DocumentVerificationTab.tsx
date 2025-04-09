
import React from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import DocumentVerification from '@/components/KYC/DocumentVerification';

interface DocumentVerificationTabProps {
  kycData: KycVerificationData | null;
  hasIdFront: boolean;
  hasIdBack: boolean;
  hasSelfie: boolean;
  isPending: boolean;
  isSubmitting: boolean;
  uploadPending?: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
  onManualRefresh?: () => Promise<void>; // Add manual refresh handler
  debugInfo?: any;
}

const DocumentVerificationTab: React.FC<DocumentVerificationTabProps> = ({
  kycData,
  hasIdFront,
  hasIdBack,
  hasSelfie,
  isPending,
  isSubmitting,
  uploadPending,
  onBack,
  onSubmit,
  onUpload,
  onManualRefresh,
  debugInfo
}) => {
  return (
    <DocumentVerification
      hasIdFront={hasIdFront}
      hasIdBack={hasIdBack}
      hasSelfie={hasSelfie}
      isPending={isPending}
      isSubmitting={isSubmitting || !!uploadPending}
      onBack={onBack}
      onSubmit={onSubmit}
      onUpload={onUpload}
      onManualRefresh={onManualRefresh} // Pass the manual refresh handler
      clarificationMessage={kycData?.clarification_message}
      debugInfo={debugInfo}
    />
  );
};

export default DocumentVerificationTab;
