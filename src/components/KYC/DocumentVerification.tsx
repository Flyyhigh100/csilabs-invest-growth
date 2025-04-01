
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import DocumentUpload from './DocumentUpload';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

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
      <div>
        <h3 className="text-lg font-medium mb-2">ID Verification</h3>
        <p className="text-sm text-gray-500 mb-4">
          Please upload clear images of your ID document (both sides) and a selfie.
        </p>
        
        {!isStorageAvailable && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Document storage is temporarily unavailable. Please try again later or contact support.</span>
          </div>
        )}
        
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {uploadError}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DocumentUpload
            documentType="id_front"
            title="Front of ID"
            isUploaded={hasIdFront}
            isPending={isPending}
            isDisabled={!isStorageAvailable}
            onUpload={onUpload}
          />
          
          <DocumentUpload
            documentType="id_back"
            title="Back of ID"
            isUploaded={hasIdBack}
            isPending={isPending}
            isDisabled={!isStorageAvailable}
            onUpload={onUpload}
          />
          
          <DocumentUpload
            documentType="selfie"
            title="Selfie with ID"
            isUploaded={hasSelfie}
            isPending={isPending}
            isDisabled={!isStorageAvailable}
            onUpload={onUpload}
          />
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
          <p><strong>Requirements:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Files must be clear, readable image formats (JPG, PNG)</li>
            <li>Maximum file size: 5MB per image</li>
            <li>For the selfie, hold your ID next to your face</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onBack}
          disabled={showSubmitSpinner}
        >
          Back
        </Button>
        <Button 
          type="button"
          disabled={isButtonDisabled}
          onClick={handleSubmitClick}
          className="relative"
        >
          {showSubmitSpinner ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Verification"
          )}
        </Button>
      </div>
    </div>
  );
};

export default DocumentVerification;
