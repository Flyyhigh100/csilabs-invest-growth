
import React from 'react';
import { AlertCircle, QrCode } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QRCodeDisplay from './QRCodeDisplay';

interface QRCodeSectionProps {
  qrCodeUrl?: string;
  address?: string;  // Added this prop to match what's being passed
  paymentAddress?: string;  // Keep this for backward compatibility
  currency: string;
  amount?: string | number;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({
  qrCodeUrl,
  address,
  paymentAddress,
  currency,
  amount
}) => {
  // Use either address or paymentAddress, whichever is provided
  const actualAddress = address || paymentAddress || '';
  
  if (!qrCodeUrl && !actualAddress) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          QR code and payment address information is missing.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col items-center">
      <div className="text-sm font-medium mb-2 text-center">
        Scan QR Code to Pay {amount} {currency}
      </div>
      
      {qrCodeUrl ? (
        <QRCodeDisplay 
          qrCodeUrl={qrCodeUrl} 
          paymentAddress={actualAddress}
          currency={currency}
        />
      ) : (
        <div className="bg-white p-6 rounded-lg border border-gray-200 w-full max-w-[200px] h-[200px] mx-auto flex items-center justify-center">
          <div className="text-gray-400 flex flex-col items-center">
            <QrCode className="h-10 w-10 mb-2" />
            <p className="text-xs text-center">QR code not available</p>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Scan this QR code with your wallet app to make payment
      </p>
    </div>
  );
};

export default QRCodeSection;
