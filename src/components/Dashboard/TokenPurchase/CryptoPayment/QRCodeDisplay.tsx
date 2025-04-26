
import React from 'react';
import { QrCode } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  onLoad: () => void;
  onError: () => void;
  isLoading: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeUrl,
  onLoad,
  onError,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-50 rounded">
        <Skeleton className="w-[280px] h-[280px]" />
      </div>
    );
  }

  return (
    <img 
      src={qrCodeUrl} 
      alt="Payment QR Code" 
      className="w-[300px] h-[300px] object-contain border border-gray-100 rounded"
      onLoad={onLoad}
      onError={onError}
    />
  );
};

export default QRCodeDisplay;
