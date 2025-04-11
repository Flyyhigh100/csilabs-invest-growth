
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface IPNLogErrorStateProps {
  error: Error;
}

const IPNLogErrorState: React.FC<IPNLogErrorStateProps> = ({ error }) => {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <p className="text-sm text-red-800">Error loading IPN logs</p>
      </div>
      <p className="mt-2 text-xs text-red-700">{error.message}</p>
    </div>
  );
};

export default IPNLogErrorState;
