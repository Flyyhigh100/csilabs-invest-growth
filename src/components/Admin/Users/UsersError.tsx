
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UsersErrorProps {
  error: Error;
  onRetry: () => void;
}

const UsersError: React.FC<UsersErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="p-6 bg-red-50 text-red-800 rounded-md">
      <h3 className="font-bold mb-2">Error loading users</h3>
      <p className="mb-4">{error.message}</p>
      <p className="mb-4 text-sm text-red-700">
        This could be due to authentication issues or problems connecting to the database.
      </p>
      <Button 
        variant="destructive" 
        onClick={onRetry} 
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
};

export default UsersError;
