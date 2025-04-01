
import React, { useEffect, useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import DocumentVerification from '@/components/KYC/DocumentVerification';
import { KycVerificationData } from '@/hooks/kyc/types';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

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
  
  // Check for document URLs on component mount to detect potential storage issues
  useEffect(() => {
    // Check if documents are partially uploaded but not visible
    const hasAttemptedUpload = 
      (kycData?.id_front_url && !hasIdFront) || 
      (kycData?.id_back_url && !hasIdBack) || 
      (kycData?.selfie_url && !hasSelfie);
    
    if (hasAttemptedUpload) {
      console.warn("Document URLs exist but files may not be accessible:");
      console.log({
        id_front_url: kycData?.id_front_url,
        id_back_url: kycData?.id_back_url,
        selfie_url: kycData?.selfie_url,
        hasIdFront,
        hasIdBack,
        hasSelfie
      });
      
      setUploadError("There might be an issue with document storage. Please try uploading again.");
    } else {
      setUploadError(null);
    }
  }, [kycData, hasIdFront, hasIdBack, hasSelfie]);
  
  // Wrapper for upload to add better error handling
  const handleUpload = async (file: File, type: 'id_front' | 'id_back' | 'selfie') => {
    setUploadError(null);
    
    try {
      await onUpload(file, type);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setUploadError(`Upload failed: ${error instanceof Error ? error.message : 'Server error'}`);
      toast.error(`Upload failed. Please try again.`);
    }
  };

  return (
    <TabsContent value="document-verification" className="py-4">
      {uploadError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Document upload issue</p>
            <p className="text-sm">{uploadError}</p>
          </div>
        </div>
      )}
      
      <DocumentVerification
        hasIdFront={hasIdFront}
        hasIdBack={hasIdBack}
        hasSelfie={hasSelfie}
        isPending={uploadPending}
        isSubmitting={isSubmitting}
        onBack={onBack}
        onSubmit={onSubmit}
        onUpload={handleUpload}
      />
    </TabsContent>
  );
};

export default DocumentVerificationTab;
