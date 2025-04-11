
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TransactionErrorStateProps {
  errorMessage?: string;
  details?: string;
  retry?: () => void;
}

const TransactionErrorState: React.FC<TransactionErrorStateProps> = ({ 
  errorMessage = "Failed to load transactions",
  details,
  retry
}) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{errorMessage}. Please try again later.</p>
        {details && (
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer">View Error Details</summary>
            <pre className="mt-2 p-2 bg-red-50 rounded text-xs overflow-x-auto max-h-40 whitespace-pre-wrap">
              {details}
            </pre>
          </details>
        )}
        {retry && (
          <div className="mt-2">
            <button 
              onClick={retry}
              className="text-xs underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default TransactionErrorState;
