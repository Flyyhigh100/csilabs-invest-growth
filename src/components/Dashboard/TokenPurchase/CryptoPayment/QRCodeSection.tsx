
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
  
  // Validate the payment address format
  const isValidAddress = useMemo(() => {
    if (!paymentAddress) return false;
    // Check for valid BEP-20/ERC-20 address format
    return /^0x[a-fA-F0-9]{40}$/.test(paymentAddress);
  }, [paymentAddress]);
  
  // Determine which QR code URL to use
  const displayQrCodeUrl = useMemo(() => {
    if (!isValidAddress) {
      console.error("Invalid payment address format:", paymentAddress);
      return null;
    }
    
    if (qrCodeUrl) {
      console.log("Using CoinPayments QR code URL:", qrCodeUrl);
      return qrCodeUrl;
    }
    
    // Generate QR code with payment data
    const qrData = {
      address: paymentAddress,
      network: 'BSC', // For BEP-20 tokens
      type: 'address'
    };
    
    const fallbackUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(JSON.stringify(qrData))}&choe=UTF-8`;
    console.log("Using fallback QR code URL with payment data");
    return fallbackUrl;
  }, [qrCodeUrl, paymentAddress, isValidAddress]);

  // Handle successful loading
  const handleImageLoad = () => {
    console.log("QR code image loaded successfully");
    setIsLoading(false);
    setLoadError(false);
  };

  // Handle loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Error loading QR code image:', e);
    setLoadError(true);
    setIsLoading(false);
  };

  if (!isValidAddress) {
    return (
      <Alert variant="destructive" className="mb-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid payment address format. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

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
            QR code failed to load. Please use the payment address below.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-50 rounded">
          <Skeleton className="w-[280px] h-[280px]" />
        </div>
      ) : null}
      
      {!loadError && displayQrCodeUrl && (
        <img 
          src={displayQrCodeUrl} 
          alt="Payment QR Code" 
          className={`w-[300px] h-[300px] object-contain ${isLoading ? 'hidden' : ''} border border-gray-100 rounded`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        Scan to make payment
      </p>
      <p className="text-xs text-gray-500">
        Enter amount manually in your wallet app if needed
      </p>
    </div>
  );
};

export default QRCodeSection;
