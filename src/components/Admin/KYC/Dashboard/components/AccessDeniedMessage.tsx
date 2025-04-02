
import React from 'react';

interface AccessDeniedMessageProps {
  onRetryAccess: () => void;
}

const AccessDeniedMessage: React.FC<AccessDeniedMessageProps> = ({ onRetryAccess }) => {
  return (
    <div className="p-8 bg-red-50 border border-red-200 rounded-md text-center">
      <h2 className="text-xl font-bold text-red-800 mb-4">Admin Access Required</h2>
      <p className="mb-4">You do not have admin permissions to view KYC verifications.</p>
      <button 
        onClick={onRetryAccess}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Retry Access Check
      </button>
    </div>
  );
};

export default AccessDeniedMessage;
