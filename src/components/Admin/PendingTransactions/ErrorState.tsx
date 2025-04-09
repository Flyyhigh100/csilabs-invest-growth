
import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: Error;
  refetch: () => void;
}

const ErrorState = ({ error, refetch }: ErrorStateProps) => {
  return (
    <div className="bg-red-50 p-4 rounded-md">
      <p className="text-red-800">Error loading transactions: {error.message}</p>
      <Button onClick={() => refetch()} variant="outline" className="mt-2">
        Retry
      </Button>
    </div>
  );
};

export default ErrorState;
