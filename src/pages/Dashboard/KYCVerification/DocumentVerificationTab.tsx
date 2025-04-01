
import React, { useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { KycVerificationData } from '@/hooks/kyc/types';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';
import { useStorageStatus } from '@/hooks/kyc/hooks/useStorageStatus';
import StorageStatusMessage from '@/components/KYC/StorageStatusMessage';
import DocumentUploadHandler from '@/components/KYC/DocumentUploadHandler';

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
  // Use our custom hook for storage status management
  const {
    storageStatus,
    uploadError,
    isStorageChecking,
    setUploadError,
    handleRetryStorage
  } = useStorageStatus();
  
  // Check for document URLs on component mount to detect potential storage issues
  useEffect(() => {
    if (!kycData) return;
    
    const hasIdFront = !!kycData.id_front_url;
    const hasIdBack = !!kycData.id_back_url;
    const hasSelfie = !!kycData.selfie_url;
    
    // Check if documents are partially uploaded but not visible
    const hasAttemptedUpload = 
      (kycData.id_front_url && !hasIdFront) || 
      (kycData.id_back_url && !hasIdBack) || 
      (kycData.selfie_url && !hasSelfie);
    
    if (hasAttemptedUpload) {
      kycLogger.log(LogLevel.WARN, "Document URLs exist but files may not be accessible:", {
        id_front_url: kycData.id_front_url,
        id_back_url: kycData.id_back_url,
        selfie_url: kycData.selfie_url,
        hasIdFront,
        hasIdBack,
        hasSelfie
      });
      
      if (!uploadError) {
        setUploadError("There might be an issue with document storage. Please try uploading again.");
      }
    }
  }, [kycData, uploadError, setUploadError]);

  return (
    <TabsContent value="document-verification" className="py-4">
      {/* Display storage status messages */}
      <StorageStatusMessage
        status={storageStatus}
        error={uploadError}
        isChecking={isStorageChecking}
        onRetry={handleRetryStorage}
      />
      
      {/* Document upload handler component */}
      <DocumentUploadHandler
        kycData={kycData}
        uploadPending={uploadPending}
        isSubmitting={isSubmitting}
        onBack={onBack}
        onSubmit={onSubmit}
        onUpload={onUpload}
        storageStatus={storageStatus}
        setUploadError={setUploadError}
        isStorageChecking={isStorageChecking}
      />
    </TabsContent>
  );
};

export default DocumentVerificationTab;
