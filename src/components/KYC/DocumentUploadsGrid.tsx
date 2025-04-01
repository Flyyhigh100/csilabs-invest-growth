
import React from 'react';
import DocumentUpload from './DocumentUpload';

interface DocumentUploadsGridProps {
  hasIdFront: boolean;
  hasIdBack: boolean;
  hasSelfie: boolean;
  isPending: boolean;
  isStorageAvailable: boolean;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
}

const DocumentUploadsGrid: React.FC<DocumentUploadsGridProps> = ({
  hasIdFront,
  hasIdBack,
  hasSelfie,
  isPending,
  isStorageAvailable,
  onUpload,
}) => {
  return (
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
  );
};

export default DocumentUploadsGrid;
