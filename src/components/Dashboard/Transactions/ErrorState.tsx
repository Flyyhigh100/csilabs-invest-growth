
import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: Error;
  refetch: () => void;
}

const ErrorState = ({ error, refetch }: ErrorStateProps) => (
  <div className="bg-red-50 p-4 rounded-md">
    <p className="text-red-800">Failed to load transaction history: {error.message}</p>
    <Button variant="outline" className="mt-2" onClick={refetch}>
      Try Again
    </Button>
  </div>
);

export default ErrorState;
