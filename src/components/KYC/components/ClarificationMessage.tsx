
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ClarificationMessageProps {
  message: string | null | undefined;
}

const ClarificationMessage: React.FC<ClarificationMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-800">Additional Information Requested</h4>
          <p className="text-blue-700 text-sm mt-1">{message}</p>
          <p className="text-sm text-blue-600 mt-2">
            Please review the message above and re-upload your documents.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClarificationMessage;
