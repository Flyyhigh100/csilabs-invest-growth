
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface WalletRequiredAlertProps {
  walletAddress: string | null;
}

const WalletRequiredAlert: React.FC<WalletRequiredAlertProps> = ({ walletAddress }) => {
  if (walletAddress) return null;
  
  return (
    <Alert className="mb-6 bg-red-50 border-red-200">
      <AlertTriangle className="h-5 w-5 text-red-500" />
      <AlertTitle className="text-red-700 font-medium">Wallet Address Required</AlertTitle>
      <AlertDescription className="text-red-600">
        Please add your Polygon wallet address above before proceeding with payment.
        <br />
        <span className="text-sm font-medium">Your tokens will be sent to this address after purchase.</span>
      </AlertDescription>
    </Alert>
  );
};

export default WalletRequiredAlert;
