
import React from 'react';
import { Button } from '@/components/ui/button';
import DocumentUpload from './DocumentUpload';

interface DocumentVerificationProps {
  hasIdFront: boolean;
  hasIdBack: boolean;
  hasSelfie: boolean;
  isPending: boolean;
  isSubmitting: boolean;
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
  onBack,
  onSubmit,
  onUpload,
}) => {
  const handleSubmitClick = async () => {
    console.log("Submit button clicked, starting submission process...");
    await onSubmit();
  };

  return (
    <div className="space-y-6">
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
        >
          Back
        </Button>
        <Button 
          type="button"
          disabled={!hasIdFront || !hasIdBack || !hasSelfie || isSubmitting || isPending}
          onClick={handleSubmitClick}
          className="relative"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin inline-block">●</span>
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
