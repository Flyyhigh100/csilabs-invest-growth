import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink, Copy, CheckCircle, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CryptoPaymentDetailsType {
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

interface CryptoPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDetails: CryptoPaymentDetailsType | null;
  amount: number;
  selectedCurrency: string;
}

interface TransactionStatus {
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  amount: number;
  paymentMethod: string;
  updatedAt: string;
}

const CryptoPaymentDialog: React.FC<CryptoPaymentDialogProps> = ({
  open,
  onOpenChange,
  paymentDetails,
  amount,
  selectedCurrency
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showQrExpanded, setShowQrExpanded] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  
  useEffect(() => {
    if (open && paymentDetails?.transactionId && paymentDetails?.checkStatusUrl) {
      checkTransactionStatus();
      
      const intervalId = setInterval(checkTransactionStatus, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [open, paymentDetails]);
  
  if (!paymentDetails) return null;
  
  const expiryDate = paymentDetails.expiresAt 
    ? new Date(paymentDetails.expiresAt) 
    : null;
    
  const isExpired = expiryDate ? new Date() > expiryDate : false;
  
  const currency = paymentDetails.currency || selectedCurrency;
  const networkName = getNetworkForCurrency(currency);
  
  const handleCopyAddress = () => {
    if (paymentDetails.paymentAddress) {
      navigator.clipboard.writeText(paymentDetails.paymentAddress)
        .then(() => {
          setCopySuccess(true);
          toast.success('Payment address copied to clipboard');
          setTimeout(() => setCopySuccess(false), 3000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast.error('Failed to copy address');
        });
    }
  };
  
  const checkTransactionStatus = async () => {
    if (!paymentDetails?.checkStatusUrl && !paymentDetails?.transactionId) {
      return;
    }
    
    setIsCheckingStatus(true);
    
    try {
      let statusData;
      
      if (paymentDetails.checkStatusUrl) {
        const response = await fetch(paymentDetails.checkStatusUrl);
        if (!response.ok) {
          throw new Error('Failed to check transaction status');
        }
        statusData = await response.json();
      } else {
        const { data, error } = await supabase.functions.invoke('create-crypto-payment/status', {
          body: { transactionId: paymentDetails.transactionId }
        });
        
        if (error) throw error;
        statusData = data;
      }
      
      setTransactionStatus(statusData);
      
      if (statusData.status === 'completed' && (!transactionStatus || transactionStatus.status !== 'completed')) {
        toast.success('Transaction completed! Your tokens will be sent to your wallet shortly.');
      } else if (statusData.status === 'failed' && (!transactionStatus || transactionStatus.status !== 'failed')) {
        toast.error('Transaction failed. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      toast.error('Failed to check transaction status');
    } finally {
      setIsCheckingStatus(false);
    }
  };
  
  function getNetworkForCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case 'BTC':
        return 'Bitcoin';
      case 'ETH':
        return 'Ethereum';
      case 'DOGE':
        return 'Dogecoin';
      case 'XRP':
        return 'Ripple';
      case 'LTCT':
        return 'Litecoin Testnet';
      case 'USDT':
      default:
        return 'Polygon';
    }
  }
  
  const renderStatusBadge = () => {
    if (!transactionStatus) return null;
    
    switch (transactionStatus.status) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-md">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Completed</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-md">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Failed</span>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-md">
            <RefreshCw className={`h-5 w-5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
            <span className="font-medium">Pending</span>
          </div>
        );
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cryptocurrency Payment</DialogTitle>
            <DialogDescription>
              Follow these instructions to complete your purchase
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {transactionStatus && (
              <div className="mb-4">
                <Label className="mb-2 block">Transaction Status</Label>
                <div className="flex justify-between items-center">
                  {renderStatusBadge()}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={checkTransactionStatus}
                          disabled={isCheckingStatus}
                        >
                          <RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Check status</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {transactionStatus.status === 'completed' && (
                  <Alert className="mt-2 bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Payment Successful</AlertTitle>
                    <AlertDescription>
                      Your transaction has been completed. Your tokens will be sent to your wallet shortly.
                    </AlertDescription>
                  </Alert>
                )}
                
                {transactionStatus.status === 'failed' && (
                  <Alert className="mt-2 bg-red-50 text-red-700 border-red-200">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Payment Failed</AlertTitle>
                    <AlertDescription>
                      Your transaction has failed. Please try again or contact support for assistance.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          
            {paymentDetails.qrCodeUrl && (
              <div className="mx-auto w-48 mb-4 cursor-pointer" onClick={() => setShowQrExpanded(true)}>
                <AspectRatio ratio={1}>
                  <img 
                    src={paymentDetails.qrCodeUrl} 
                    alt="Payment QR Code" 
                    className="rounded-md border object-cover"
                  />
                </AspectRatio>
                <p className="text-xs text-center mt-1 text-muted-foreground">Click to enlarge QR code</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Payment Address ({currency} on {networkName})</Label>
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-md font-mono text-sm break-all flex-1 mr-2">
                  {paymentDetails.paymentAddress}
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleCopyAddress}
                  title="Copy address"
                  className="flex-shrink-0"
                >
                  {copySuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="p-2 bg-gray-100 rounded-md">
                {amount} {currency}
              </div>
            </div>
            
            {expiryDate && (
              <div className="space-y-2">
                <Label>Expires</Label>
                <div className={`p-2 rounded-md ${isExpired ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                  {expiryDate.toLocaleString()}
                  {isExpired && ' (Expired)'}
                </div>
              </div>
            )}
            
            <Alert>
              <Info className="h-5 w-5" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                {paymentDetails.instructions || `Please send ${amount} ${currency} to the address above to complete your purchase.`}
              </AlertDescription>
            </Alert>
            
            {paymentDetails.statusUrl && (
              <Button 
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => window.open(paymentDetails.statusUrl, '_blank')}
              >
                <ExternalLink size={16} />
                Check Payment Status
              </Button>
            )}
            
            <div className="text-sm text-muted-foreground">
              <div>Transaction ID: {paymentDetails.transactionId}</div>
              {paymentDetails.externalTransactionId && (
                <div>Payment ID: {paymentDetails.externalTransactionId}</div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Sheet open={showQrExpanded} onOpenChange={setShowQrExpanded}>
        <SheetContent side="bottom" className="h-auto max-h-[90vh] overflow-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>QR Code</SheetTitle>
            <SheetDescription>
              Scan this QR code with your crypto wallet app
            </SheetDescription>
          </SheetHeader>
          
          <div className="max-w-sm mx-auto">
            {paymentDetails.qrCodeUrl && (
              <img 
                src={paymentDetails.qrCodeUrl} 
                alt="Payment QR Code" 
                className="w-full h-auto border rounded-lg"
              />
            )}
            
            <div className="mt-6 space-y-4">
              <div>
                <Label>Payment Address</Label>
                <div className="p-2 bg-gray-100 rounded-md font-mono text-sm break-all mt-1">
                  {paymentDetails.paymentAddress}
                </div>
              </div>
              
              <div>
                <Label>Amount</Label>
                <div className="p-2 bg-gray-100 rounded-md mt-1">
                  {amount} {currency}
                </div>
              </div>
              
              <Button onClick={handleCopyAddress} className="w-full mt-4" variant="secondary">
                {copySuccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copy Address
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CryptoPaymentDialog;
