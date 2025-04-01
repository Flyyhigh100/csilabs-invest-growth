
import React, { useEffect, useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import DocumentVerification from '@/components/KYC/DocumentVerification';
import { KycVerificationData } from '@/hooks/kyc/types';
import { toast } from 'sonner';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkStorageAvailability, initializeStorage, getStorageStatus } from '@/services/storage/initStorage';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';

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
  
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isStorageChecking, setIsStorageChecking] = useState(false);
  const [storageStatus, setStorageStatus] = useState(getStorageStatus());
  
  // Check storage buckets on component mount
  useEffect(() => {
    const checkStorage = async () => {
      try {
        setIsStorageChecking(true);
        kycLogger.log(LogLevel.INFO, 'Checking storage availability in DocumentVerificationTab');
        
        // Check if storage is available
        const status = await checkStorageAvailability();
        
        if (status === 'available') {
          kycLogger.log(LogLevel.INFO, 'Storage is available');
          setStorageStatus('available');
          setUploadError(null);
        } else {
          kycLogger.log(LogLevel.WARN, 'Storage not available, attempting to initialize');
          
          // Try to initialize storage
          const initialized = await initializeStorage();
          
          if (initialized) {
            kycLogger.log(LogLevel.INFO, 'Storage initialized successfully');
            setStorageStatus('available');
            setUploadError(null);
          } else {
            kycLogger.log(LogLevel.ERROR, 'Storage initialization failed');
            setStorageStatus('unavailable');
            setUploadError('Storage service is currently unavailable. Please try again later or contact support.');
          }
        }
      } catch (error) {
        kycLogger.log(LogLevel.ERROR, 'Error checking storage:', error);
        setStorageStatus('unavailable');
        setUploadError('Unable to connect to storage service. Please try again later.');
      } finally {
        setIsStorageChecking(false);
      }
    };
    
    checkStorage();
  }, []);
  
  // Check for document URLs on component mount to detect potential storage issues
  useEffect(() => {
    // Check if documents are partially uploaded but not visible
    const hasAttemptedUpload = 
      (kycData?.id_front_url && !hasIdFront) || 
      (kycData?.id_back_url && !hasIdBack) || 
      (kycData?.selfie_url && !hasSelfie);
    
    if (hasAttemptedUpload) {
      kycLogger.log(LogLevel.WARN, "Document URLs exist but files may not be accessible:", {
        id_front_url: kycData?.id_front_url,
        id_back_url: kycData?.id_back_url,
        selfie_url: kycData?.selfie_url,
        hasIdFront,
        hasIdBack,
        hasSelfie
      });
      
      if (!uploadError) {
        setUploadError("There might be an issue with document storage. Please try uploading again.");
      }
    }
  }, [kycData, hasIdFront, hasIdBack, hasSelfie, uploadError]);
  
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
  
  const handleRetryStorage = async () => {
    setIsStorageChecking(true);
    setUploadError(null);
    
    try {
      kycLogger.log(LogLevel.INFO, 'Manually retrying storage initialization');
      const initialized = await initializeStorage();
      
      if (initialized) {
        const status = await checkStorageAvailability(true);
        setStorageStatus(status);
        
        if (status === 'available') {
          toast.success('Storage service is now available');
        } else {
          setUploadError('Storage is still unavailable. Please try again later or contact support.');
          toast.error('Storage service is still unavailable');
        }
      } else {
        setStorageStatus('unavailable');
        setUploadError('Storage initialization failed. Please try again later or contact support.');
        toast.error('Storage service initialization failed');
      }
    } catch (error) {
      kycLogger.log(LogLevel.ERROR, 'Error retrying storage check:', error);
      setStorageStatus('unavailable');
      setUploadError('Unable to connect to storage service. Please try again later.');
      toast.error('Storage service connection failed');
    } finally {
      setIsStorageChecking(false);
    }
  };

  return (
    <TabsContent value="document-verification" className="py-4">
      {storageStatus === 'unavailable' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Storage service unavailable</p>
            <p className="text-sm">Document upload is currently unavailable. Please try again later or contact support.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleRetryStorage}
              disabled={isStorageChecking}
            >
              {isStorageChecking ? 'Checking...' : 'Retry Storage Connection'}
            </Button>
          </div>
        </div>
      )}
      
      {storageStatus === 'available' && uploadError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Document upload issue</p>
            <p className="text-sm">{uploadError}</p>
          </div>
        </div>
      )}
      
      {isStorageChecking && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 flex items-center">
          <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>Checking storage service availability...</span>
        </div>
      )}
      
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
    </TabsContent>
  );
};

export default DocumentVerificationTab;
