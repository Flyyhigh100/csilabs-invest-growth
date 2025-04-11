
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

const KycRequiredAlert: React.FC = () => {
  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <ShieldAlert className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">KYC Required</AlertTitle>
      <AlertDescription className="text-amber-700">
        You need to complete KYC verification before making transactions.
      </AlertDescription>
    </Alert>
  );
};

export default KycRequiredAlert;
