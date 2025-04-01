
import React, { useState } from 'react';
import { toast } from 'sonner';
import DocumentVerificationHeader from './DocumentVerificationHeader';
import DocumentUploadsGrid from './DocumentUploadsGrid';
import DocumentRequirements from './DocumentRequirements';
import DocumentActionButtons from './DocumentActionButtons';

interface DocumentVerificationProps {
  hasIdFront: boolean;
  hasIdBack: boolean;
  hasSelfie: boolean;
  isPending: boolean;
  isSubmitting: boolean;
  isStorageAvailable?: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
}

const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  hasIdFront,
  hasIdBack,
  hasSelfie,
  isPending,
  isSubmitting,
  isStorageAvailable = true,
  onBack,
  onSubmit,
  onUpload,
}) => {
  // Local state to track submission attempts
  const [isAttemptingSubmit, setIsAttemptingSubmit] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmitClick = async () => {
    // Debug - log the state at button click
    console.log("Submit button clicked, starting submission process...");
    console.log("Current document states:", { hasIdFront, hasIdBack, hasSelfie });
    console.log("Current process states:", { isPending, isSubmitting, isAttemptingSubmit });
    
    // Clear any previous errors
    setUploadError(null);
    
    // Validation check - should never happen due to button disabled state, but double-checking
    if (!hasIdFront || !hasIdBack || !hasSelfie) {
      const missingDocs = [];
      if (!hasIdFront) missingDocs.push("front of ID");
      if (!hasIdBack) missingDocs.push("back of ID");
      if (!hasSelfie) missingDocs.push("selfie");
      
      const errorMsg = `Please upload all required documents: ${missingDocs.join(", ")}`;
      setUploadError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    // Set local state to show immediate feedback
    setIsAttemptingSubmit(true);
    
    try {
      toast.info("Submitting verification...");
      console.log("Calling onSubmit function");
      await onSubmit();
      console.log("Submission completed successfully");
      toast.success("Verification submitted successfully!");
    } catch (error) {
      console.error("Error in submission:", error);
      setUploadError("Failed to submit verification. Please try again.");
      toast.error("Failed to submit verification. Please try again.");
    } finally {
      setIsAttemptingSubmit(false);
    }
  };

  // Combined submission state for UI feedback
  const showSubmitSpinner = isSubmitting || isAttemptingSubmit;
  const isButtonDisabled = !hasIdFront || !hasIdBack || !hasSelfie || showSubmitSpinner || isPending || !isStorageAvailable;

  return (
    <div className="space-y-6">
      <DocumentVerificationHeader 
        isStorageAvailable={isStorageAvailable}
        uploadError={uploadError}
      />
      
      <DocumentUploadsGrid 
        hasIdFront={hasIdFront}
        hasIdBack={hasIdBack}
        hasSelfie={hasSelfie}
        isPending={isPending}
        isStorageAvailable={isStorageAvailable}
        onUpload={onUpload}
      />
      
      <DocumentRequirements />
      
      <DocumentActionButtons 
        isSubmitting={showSubmitSpinner}
        isButtonDisabled={isButtonDisabled}
        onBack={onBack}
        onSubmit={handleSubmitClick}
      />
    </div>
  );
};

export default DocumentVerification;
