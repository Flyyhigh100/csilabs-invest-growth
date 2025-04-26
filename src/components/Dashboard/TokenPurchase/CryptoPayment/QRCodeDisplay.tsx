
import React from 'react';
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  onLoad: () => void;
  onError: () => void;
  isLoading: boolean;
  size?: number;
  fallbackContent?: React.ReactNode;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qrCodeUrl, 
  onLoad, 
  onError, 
  isLoading,
  size = 200,
  fallbackContent
}) => {
  return (
    <div className="relative w-full flex items-center justify-center py-2">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded z-10">
          <Spinner className="h-8 w-8 text-cbis-blue" />
        </div>
      )}
      
      {qrCodeUrl ? (
        <img
          src={qrCodeUrl}
          alt="Payment QR Code"
          className="mx-auto rounded border border-gray-200"
          style={{ width: `${size}px`, height: `${size}px` }}
          onLoad={onLoad}
          onError={onError}
        />
      ) : (
        <div className="w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to generate QR code. Please use the payment address below instead.
            </AlertDescription>
          </Alert>
          {fallbackContent}
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
