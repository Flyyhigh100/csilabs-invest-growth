
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletRequiredAlertProps {
  walletAddress: string | null;
}

const WalletRequiredAlert: React.FC<WalletRequiredAlertProps> = ({ walletAddress }) => {
  if (walletAddress) return null;
  
  const scrollToWalletSection = () => {
    document.getElementById('wallet-address-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  return (
    <Alert className="mb-5 bg-amber-50 border border-amber-200 shadow-sm">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertTitle className="text-amber-800 font-medium text-base mb-1">Wallet Address Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            Please add your Polygon wallet address in Step 1 before proceeding with payment.
            <br />
            <span className="text-sm font-medium mt-1 inline-block">Your tokens will be sent to this address after purchase.</span>
            <div className="mt-3">
              <Button 
                size="sm"
                variant="outline"
                onClick={scrollToWalletSection}
                className="bg-white border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
              >
                Add Wallet Address
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default WalletRequiredAlert;
