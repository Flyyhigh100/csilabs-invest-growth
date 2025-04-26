
import React, { useMemo, useState } from 'react';
import { QrCode, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QRCodeSectionProps {
  qrCodeUrl?: string;
  paymentAddress: string;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ qrCodeUrl, paymentAddress }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  // Determine which QR code URL to use
  const displayQrCodeUrl = useMemo(() => {
    if (qrCodeUrl) {
      console.log("Using CoinPayments QR code URL:", qrCodeUrl);
      return qrCodeUrl;
    }
    // Only generate a QR code for the address as a fallback
    const fallbackUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(paymentAddress)}&choe=UTF-8`;
    console.log("Using fallback QR code URL:", fallbackUrl);
    return fallbackUrl;
  }, [qrCodeUrl, paymentAddress]);

  // Handle successful loading
  const handleImageLoad = () => {
    console.log("QR code image loaded successfully");
    setIsLoading(false);
  };

  // Handle loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Error loading QR code image:', e);
    setLoadError(true);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 text-center flex flex-col items-center">
      <h3 className="text-sm font-medium mb-2 flex items-center justify-center gap-1">
        <QrCode className="h-4 w-4" />
        Scan QR Code
      </h3>
      
      {loadError ? (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            QR code failed to load. Use the payment address below instead.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded">
          <Skeleton className="w-44 h-44" />
        </div>
      ) : null}
      
      {!loadError && displayQrCodeUrl && (
        <img 
          src={displayQrCodeUrl} 
          alt="Payment QR Code" 
          className={`w-48 h-48 object-contain ${isLoading ? 'hidden' : ''} border border-gray-100 rounded`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        {qrCodeUrl ? 'Scan to make payment' : 'QR code contains payment address'}
      </p>
      <p className="text-xs text-gray-500">
        Enter amount manually in your wallet app if needed
      </p>
    </div>
  );
};

export default QRCodeSection;
