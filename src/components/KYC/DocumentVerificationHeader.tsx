
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DocumentVerificationHeaderProps {
  isStorageAvailable: boolean;
  uploadError: string | null;
}

const DocumentVerificationHeader: React.FC<DocumentVerificationHeaderProps> = ({
  isStorageAvailable,
  uploadError,
}) => {
  return (
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
    </div>
  );
};

export default DocumentVerificationHeader;
