
import React from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import DocumentVerification from '@/components/KYC/DocumentVerification';

interface DocumentVerificationTabProps {
  kycData: KycVerificationData | null;
  uploadPending: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
  debugInfo?: any;
}

const DocumentVerificationTab: React.FC<DocumentVerificationTabProps> = ({
  kycData,
  uploadPending,
  isSubmitting,
  onBack,
  onSubmit,
  onUpload,
  debugInfo
}) => {
  const isPending = kycData?.status === 'pending';
  const hasIdFront = !!kycData?.id_front_url;
  const hasIdBack = !!kycData?.id_back_url;
  const hasSelfie = !!kycData?.selfie_url;
  
  return (
    <DocumentVerification
      hasIdFront={hasIdFront}
      hasIdBack={hasIdBack}
      hasSelfie={hasSelfie}
      isPending={isPending}
      isSubmitting={isSubmitting}
      onBack={onBack}
      onSubmit={onSubmit}
      onUpload={onUpload}
      clarificationMessage={kycData?.clarification_message}
      debugInfo={debugInfo}
    />
  );
};

export default DocumentVerificationTab;
