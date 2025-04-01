
import React, { useState, useEffect } from 'react';
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
  const [localUploadError, setLocalUploadError] = useState<string | null>(null);
  
  // Clear local errors when storage status changes to prevent stale errors
  useEffect(() => {
    if (storageStatus === 'available') {
      setLocalUploadError(null);
    }
  }, [storageStatus]);
  
  // Wrapper for upload to add better error handling
  const handleUpload = async (file: File, type: 'id_front' | 'id_back' | 'selfie') => {
    // Clear both error states
    setUploadError(null);
    setLocalUploadError(null);
    
    if (storageStatus !== 'available') {
      const errorMsg = 'Storage service is currently unavailable. Please try again later.';
      setLocalUploadError(errorMsg);
      setUploadError(errorMsg);
      toast.error('Storage service is currently unavailable');
      return;
    }
    
    try {
      // Verify file size and type before uploading
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = 'File size exceeds 5MB limit';
        setLocalUploadError(errorMsg);
        setUploadError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        const errorMsg = 'Only image files are allowed';
        setLocalUploadError(errorMsg);
        setUploadError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      // Log file information for debugging purposes
      kycLogger.log(LogLevel.INFO, `Uploading ${type} document:`, {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });
      
      // Proceed with upload
      await onUpload(file, type);
      
      // Clear error after successful upload
      setLocalUploadError(null);
      setUploadError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Server error';
      kycLogger.log(LogLevel.ERROR, `Error uploading ${type}:`, error);
      setLocalUploadError(`Upload failed: ${errorMessage}`);
      setUploadError(`Upload failed: ${errorMessage}`);
      toast.error(`Upload failed. Please try again.`);
    }
  };

  // Pass the document upload handler's local error to the DocumentVerification component
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
      uploadError={localUploadError}
    />
  );
};

export default DocumentUploadHandler;
