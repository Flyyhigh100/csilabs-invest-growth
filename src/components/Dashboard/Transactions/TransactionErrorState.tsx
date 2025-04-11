
import React from 'react';
import { Alert, AlertCircle, AlertTitle, AlertDescription } from '@/components/ui/alert';

const TransactionErrorState: React.FC = () => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Failed to load transactions. Please try again later.</AlertDescription>
    </Alert>
  );
};

export default TransactionErrorState;
