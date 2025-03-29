
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import DocumentVerification from '@/components/KYC/DocumentVerification';
import { KycVerificationData } from '@/hooks/useKycVerification';

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

  return (
    <TabsContent value="document-verification" className="py-4">
      <DocumentVerification
        hasIdFront={hasIdFront}
        hasIdBack={hasIdBack}
        hasSelfie={hasSelfie}
        isPending={uploadPending}
        isSubmitting={isSubmitting}
        onBack={onBack}
        onSubmit={onSubmit}
        onUpload={onUpload}
      />
    </TabsContent>
  );
};

export default DocumentVerificationTab;
