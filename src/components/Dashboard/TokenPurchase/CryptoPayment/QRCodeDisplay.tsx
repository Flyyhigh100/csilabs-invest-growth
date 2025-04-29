
import React from 'react';
import { Image } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  paymentAddress: string;
  currency?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qrCodeUrl,
  paymentAddress,
  currency = "USDT"
}) => {
  const [error, setError] = React.useState(false);
  
  const handleImageError = () => {
    console.error("Failed to load QR code image");
    setError(true);
  };
  
  return (
    <div className="bg-white p-2 rounded-lg border border-gray-200 w-full max-w-[200px] mx-auto">
      {error ? (
        <div className="h-[200px] w-full flex flex-col items-center justify-center text-gray-400">
          <Image className="h-10 w-10 mb-2" />
          <p className="text-xs text-center">Error loading QR code</p>
          <p className="text-xs text-center mt-1">Please use the wallet address instead</p>
        </div>
      ) : (
        <img 
          src={qrCodeUrl} 
          alt={`QR code for ${currency} payment address: ${paymentAddress}`}
          className="w-full h-auto object-contain"
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default QRCodeDisplay;
