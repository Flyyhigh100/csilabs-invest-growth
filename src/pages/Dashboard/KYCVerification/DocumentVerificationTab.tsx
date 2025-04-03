
import React from 'react';
import DocumentVerification from '@/components/KYC/DocumentVerification';
import { KycVerificationData } from '@/hooks/kyc/types';

interface DocumentVerificationTabProps {
  kycData: KycVerificationData | null;
  uploadPending: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
}

const DocumentVerificationTab: React.FC<DocumentVerificationTabProps> = ({
  kycData,
  uploadPending,
  isSubmitting,
  onBack,
  onSubmit,
  onUpload
}) => {
  const hasIdFront = !!kycData?.id_front_url;
  const hasIdBack = !!kycData?.id_back_url;
  const hasSelfie = !!kycData?.selfie_url;
  const isPending = kycData?.status === 'pending';
  const clarificationMessage = kycData?.clarification_message;

  return (
    <div className="py-4">
      <DocumentVerification
        hasIdFront={hasIdFront}
        hasIdBack={hasIdBack}
        hasSelfie={hasSelfie}
        isPending={uploadPending || isPending}
        isSubmitting={isSubmitting}
        onBack={onBack}
        onSubmit={onSubmit}
        onUpload={onUpload}
        clarificationMessage={clarificationMessage}
      />
    </div>
  );
};

export default DocumentVerificationTab;
