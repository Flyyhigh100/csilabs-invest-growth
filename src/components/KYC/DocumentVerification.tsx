import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import DocumentUpload from './DocumentUpload';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentVerificationProps {
  hasIdFront: boolean;
  hasIdBack: boolean;
  hasSelfie: boolean;
  isPending: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
  clarificationMessage?: string | null;
}

const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  hasIdFront,
  hasIdBack,
  hasSelfie,
  isPending,
  isSubmitting,
  onBack,
  onSubmit,
  onUpload,
  clarificationMessage
}) => {
  // Local state to track submission attempts and status
  const [isAttemptingSubmit, setIsAttemptingSubmit] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmitClick = async () => {
    // Debug - log the state at button click
    console.log("Submit button clicked, starting submission process...");
    console.log("Current document states:", { hasIdFront, hasIdBack, hasSelfie });
    console.log("Current process states:", { isPending, isSubmitting, isAttemptingSubmit });
    
    // Validation check - should never happen due to button disabled state, but double-checking
    if (!hasIdFront || !hasIdBack || !hasSelfie) {
      toast.error("Please upload all required documents before submitting");
      return;
    }
    
    // Set local state to show immediate feedback
    setIsAttemptingSubmit(true);
    setSubmissionStatus('submitting');
    
    try {
      toast.info("Submitting verification...");
      console.log("Calling onSubmit function");
      await onSubmit();
      console.log("Submission completed successfully");
      setSubmissionStatus('success');
      toast.success("Verification submitted successfully!");
    } catch (error) {
      console.error("Error in submission:", error);
      setSubmissionStatus('error');
      toast.error("Failed to submit verification. Please try again.");
    } finally {
      // We keep isAttemptingSubmit true if successful to keep button disabled
      // Only reset it on error so they can try again
      if (submissionStatus === 'error') {
        setIsAttemptingSubmit(false);
      }
    }
  };

  // Combined submission state for UI feedback
  const showSubmitSpinner = isSubmitting || (isAttemptingSubmit && submissionStatus === 'submitting');
  const isButtonDisabled = !hasIdFront || !hasIdBack || !hasSelfie || showSubmitSpinner || isPending;

  return (
    <div className="space-y-6">
      {clarificationMessage && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Additional Information Requested</h4>
              <p className="text-blue-700 text-sm mt-1">{clarificationMessage}</p>
              <p className="text-sm text-blue-600 mt-2">
                Please review the message above and re-upload your documents.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-medium mb-2">ID Verification</h3>
        <p className="text-sm text-gray-500 mb-4">
          Please upload clear images of your ID document (both sides) and a selfie.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DocumentUpload
            documentType="id_front"
            title="Front of ID"
            isUploaded={hasIdFront}
            isPending={isPending}
            onUpload={onUpload}
          />
          
          <DocumentUpload
            documentType="id_back"
            title="Back of ID"
            isUploaded={hasIdBack}
            isPending={isPending}
            onUpload={onUpload}
          />
          
          <DocumentUpload
            documentType="selfie"
            title="Selfie with ID"
            isUploaded={hasSelfie}
            isPending={isPending}
            onUpload={onUpload}
          />
        </div>
      </div>
      
      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onBack}
          disabled={showSubmitSpinner || submissionStatus === 'success'}
        >
          Back
        </Button>
        <Button 
          type="button"
          disabled={isButtonDisabled || submissionStatus === 'success'}
          onClick={handleSubmitClick}
          className="relative"
        >
          {showSubmitSpinner ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin inline-block border-2 border-current border-t-transparent rounded-full"></span>
              Submitting...
            </>
          ) : submissionStatus === 'success' ? (
            "Submitted Successfully"
          ) : (
            "Submit Verification"
          )}
        </Button>
      </div>
      
      {submissionStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">
            Your verification has been submitted successfully and is now pending review.
            You will be redirected to the status page shortly.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;
