
import React from 'react';
import { Spinner } from "@/components/ui/spinner";

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  onLoad: () => void;
  onError: () => void;
  isLoading: boolean;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qrCodeUrl, 
  onLoad, 
  onError, 
  isLoading,
  size = 200
}) => {
  return (
    <div className="relative w-full flex items-center justify-center py-2">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded">
          <Spinner className="h-8 w-8 text-cbis-blue" />
        </div>
      )}
      <img
        src={qrCodeUrl}
        alt="Payment QR Code"
        className="mx-auto rounded border border-gray-200"
        style={{ width: `${size}px`, height: `${size}px` }}
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
};

export default QRCodeDisplay;
