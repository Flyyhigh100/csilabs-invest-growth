
import React from 'react';
import { AlertCircle, HelpCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StorageStatus } from '@/services/storage/initStorage';

interface StorageStatusMessageProps {
  status: StorageStatus;
  error: string | null;
  isChecking: boolean;
  onRetry?: () => Promise<void>;
}

const StorageStatusMessage: React.FC<StorageStatusMessageProps> = ({
  status,
  error,
  isChecking,
  onRetry
}) => {
  if (isChecking) {
    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 flex items-center">
        <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0" />
        <span>Checking storage service availability...</span>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start">
        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">Storage service error</p>
          <p className="text-sm">The storage service encountered an error during initialization.</p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={onRetry}
            >
              Reset & Retry Connection
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  if (status === 'unavailable') {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">Storage service unavailable</p>
          <p className="text-sm">Document upload is currently unavailable. Please try again later or contact support.</p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={onRetry}
            >
              Retry Storage Connection
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  if (status === 'available' && error) {
    return (
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Document upload issue</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }
  
  if (status === 'initializing') {
    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 flex items-center">
        <div className="h-5 w-5 mr-2 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        <span>Initializing storage service...</span>
      </div>
    );
  }
  
  return null;
};

export default StorageStatusMessage;
