
import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { CopyButton } from "@/components/ui/copy-button";
import { Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CryptoPaymentDetails } from "@/hooks/payments/types";
import { getCryptoIcon } from "../utils/cryptoIcons";

interface CryptoCurrencyPaymentInfoProps {
  paymentDetails: CryptoPaymentDetails;
  remainingTime?: string;
}

const CryptoCurrencyPaymentInfo: React.FC<CryptoCurrencyPaymentInfoProps> = ({
  paymentDetails,
  remainingTime
}) => {
  if (!paymentDetails) return null;

  const currency = paymentDetails.currency || "USDT";
  const CurrencyIcon = getCryptoIcon(currency);

  return (
    <div className="mt-4 flex flex-col items-center">
      <div className="flex items-center mb-4">
        {CurrencyIcon && <CurrencyIcon className="h-8 w-8 mr-2 text-blue-600" />}
        <h3 className="text-xl font-medium">Send {currency}</h3>
      </div>

      {paymentDetails.qrCodeUrl && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <QRCodeCanvas
            value={paymentDetails.qrCodeUrl}
            size={200}
            bgColor="#fff"
            fgColor="#000"
            level="H"
            className="rounded-md"
          />
        </div>
      )}

      <div className="w-full mt-4 space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Send payment to this address:</p>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-50 rounded border flex-grow font-mono text-sm truncate">
              {paymentDetails.paymentAddress}
            </div>
            <CopyButton value={paymentDetails.paymentAddress} />
          </div>
        </div>

        {remainingTime && (
          <div className="flex items-center text-amber-600 gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Time remaining: {remainingTime}</span>
          </div>
        )}

        {paymentDetails.instructions && (
          <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-800">
            {paymentDetails.instructions}
          </div>
        )}

        {paymentDetails.statusUrl && (
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 mt-4"
            asChild
          >
            <a
              href={paymentDetails.statusUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View payment status</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CryptoCurrencyPaymentInfo;
