
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CopyIcon, CheckCircle, Clock, QrCode, Info } from "lucide-react";
import { toast } from 'sonner';

interface CryptoPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDetails: {
    paymentAddress: string;
    transactionId: string;
    instructions: string;
    qrCodeUrl?: string;
    statusUrl?: string;
    expiresAt?: string;
    externalTransactionId?: string;
    currency?: string;
    checkStatusUrl?: string;
  } | null;
  amount: number;
  selectedCurrency: string;
}

const CryptoPaymentDialog: React.FC<CryptoPaymentDialogProps> = ({
  open,
  onOpenChange,
  paymentDetails,
  amount,
  selectedCurrency
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (paymentDetails?.paymentAddress) {
      navigator.clipboard.writeText(paymentDetails.paymentAddress);
      setCopied(true);
      toast.success("Payment address copied to clipboard");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const formatTimeRemaining = (expiresAtStr?: string): string => {
    if (!expiresAtStr) return "Unknown";
    
    const expiresAt = new Date(expiresAtStr);
    const now = new Date();
    
    const diffMs = expiresAt.getTime() - now.getTime();
    if (diffMs <= 0) return "Expired";
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
    }
    
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span>Complete Your {paymentDetails?.currency || selectedCurrency} Payment</span>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none ml-2">
              Amount: ${amount}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Please follow the instructions below to complete your payment
          </DialogDescription>
        </DialogHeader>
        
        {paymentDetails ? (
          <div className="space-y-4 my-2">
            {paymentDetails.expiresAt && (
              <Alert className="bg-amber-50 border-amber-200">
                <Clock className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Time Remaining</AlertTitle>
                <AlertDescription className="text-amber-700">
                  This payment request will expire in {formatTimeRemaining(paymentDetails.expiresAt)}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
              {paymentDetails.qrCodeUrl && (
                <div className="bg-white rounded-lg p-3 border-2 border-gray-200 text-center">
                  <h3 className="text-sm font-medium mb-2 flex items-center justify-center gap-1">
                    <QrCode className="h-4 w-4" />
                    Scan QR Code
                  </h3>
                  <img 
                    src={paymentDetails.qrCodeUrl} 
                    alt="Payment QR Code" 
                    className="w-40 h-40 object-contain mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-2">Scan with your crypto wallet app</p>
                </div>
              )}
              
              <div className="space-y-4 flex-1">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium mb-2">Payment Address</h3>
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded border border-gray-200 text-sm font-mono overflow-x-auto w-full">
                      {paymentDetails.paymentAddress}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="flex-shrink-0"
                      onClick={handleCopy}
                    >
                      {copied ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <CopyIcon className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
                
                {paymentDetails.externalTransactionId && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-medium mb-2">Transaction ID</h3>
                    <p className="text-sm font-mono break-all bg-white p-2 rounded border border-gray-200">
                      {paymentDetails.externalTransactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-3">Instructions</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <ol className="list-decimal pl-5 space-y-2 text-sm text-blue-800">
                  {paymentDetails.instructions.split('\n').map((instruction, index) => (
                    instruction.trim() ? <li key={index}>{instruction}</li> : null
                  ))}
                </ol>
              </div>
            </div>
            
            {paymentDetails.statusUrl && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  Check Payment Status
                </h3>
                <p className="text-sm mb-3">
                  You can check the status of your payment on the CoinPayments website:
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a 
                    href={paymentDetails.statusUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    View Payment Status
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <p>Payment information is loading...</p>
          </div>
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="sm:order-1"
          >
            Close
          </Button>
          
          {paymentDetails?.checkStatusUrl && (
            <Button asChild className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white">
              <a 
                href={paymentDetails.checkStatusUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Check Payment Status
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoPaymentDialog;
