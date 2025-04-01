
import React from 'react';
import { toast } from 'sonner';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';
import DocumentVerification from '@/components/KYC/DocumentVerification';
import { StorageStatus } from '@/services/storage/initStorage';

interface DocumentUploadHandlerProps {
  kycData: any;
  uploadPending: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
  storageStatus: StorageStatus;
  setUploadError: (error: string | null) => void;
  isStorageChecking: boolean;
}

const DocumentUploadHandler: React.FC<DocumentUploadHandlerProps> = ({
  kycData,
  uploadPending,
  isSubmitting,
  onBack,
  onSubmit,
  onUpload,
  storageStatus,
  setUploadError,
  isStorageChecking
}) => {
  const hasIdFront = !!kycData?.id_front_url;
  const hasIdBack = !!kycData?.id_back_url;
  const hasSelfie = !!kycData?.selfie_url;
  
  // Wrapper for upload to add better error handling
  const handleUpload = async (file: File, type: 'id_front' | 'id_back' | 'selfie') => {
    setUploadError(null);
    
    if (storageStatus === 'unavailable') {
      setUploadError('Storage service is currently unavailable. Please try again later.');
      toast.error('Storage service is currently unavailable');
      return;
    }
    
    try {
      // Verify file size and type before uploading
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds 5MB limit');
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed');
        toast.error('Only image files are allowed');
        return;
      }
      
      await onUpload(file, type);
    } catch (error) {
      kycLogger.log(LogLevel.ERROR, `Error uploading ${type}:`, error);
      setUploadError(`Upload failed: ${error instanceof Error ? error.message : 'Server error'}`);
      toast.error(`Upload failed. Please try again.`);
    }
  };

  return (
    <DocumentVerification
      hasIdFront={hasIdFront}
      hasIdBack={hasIdBack}
      hasSelfie={hasSelfie}
      isPending={uploadPending || isStorageChecking}
      isSubmitting={isSubmitting}
      onBack={onBack}
      onSubmit={onSubmit}
      onUpload={handleUpload}
      isStorageAvailable={storageStatus === 'available'}
    />
  );
};

export default DocumentUploadHandler;
