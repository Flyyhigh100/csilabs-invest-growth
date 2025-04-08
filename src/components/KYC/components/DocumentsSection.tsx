
import React from 'react';
import DocumentUpload from '../DocumentUpload';

interface DocumentsSectionProps {
  hasIdFront: boolean;
  hasIdBack: boolean;
  hasSelfie: boolean;
  isPending: boolean;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  hasIdFront,
  hasIdBack,
  hasSelfie,
  isPending,
  onUpload
}) => {
  return (
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
  );
};

export default DocumentsSection;
