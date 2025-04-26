
import React, { useMemo } from 'react';
import { QrCode } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface QRCodeSectionProps {
  qrCodeUrl?: string;
  paymentAddress: string;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ qrCodeUrl, paymentAddress }) => {
  // Now we'll always use the CoinPayments QR code URL if available
  const displayQrCodeUrl = useMemo(() => {
    if (qrCodeUrl) {
      return qrCodeUrl;
    }
    // Only generate a QR code for the address as a fallback
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentAddress)}&size=200x200`;
  }, [qrCodeUrl, paymentAddress]);

  return (
    <div className="bg-white rounded-lg p-3 border-2 border-gray-200 text-center">
      <h3 className="text-sm font-medium mb-2 flex items-center justify-center gap-1">
        <QrCode className="h-4 w-4" />
        Scan QR Code
      </h3>
      {displayQrCodeUrl ? (
        <img 
          src={displayQrCodeUrl} 
          alt="Payment QR Code" 
          className="w-40 h-40 object-contain mx-auto"
          onError={(e) => {
            console.error('Error loading QR code image');
            e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentAddress)}&size=200x200`;
          }}
        />
      ) : (
        <Skeleton className="w-40 h-40 mx-auto" />
      )}
      <p className="text-xs text-gray-500 mt-2">
        {qrCodeUrl ? 'Scan to pay with CoinPayments' : 'QR code contains only the wallet address'}
      </p>
      <p className="text-xs text-gray-500">
        Enter amount manually in your wallet app if needed
      </p>
    </div>
  );
};

export default QRCodeSection;
