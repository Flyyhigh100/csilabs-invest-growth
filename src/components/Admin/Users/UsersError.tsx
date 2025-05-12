
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UsersErrorProps {
  error: Error;
  onRetry: () => void;
}

const UsersError: React.FC<UsersErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">Error loading users</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md">
        {error.message || 'An unexpected error occurred while loading user data.'}
      </p>
      <Button onClick={onRetry} variant="outline" className="mt-6">
        Retry
      </Button>
    </div>
  );
};

export default UsersError;
