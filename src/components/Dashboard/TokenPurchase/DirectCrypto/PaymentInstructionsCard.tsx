
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { PartyPopper, CopyIcon, ExternalLink } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface PaymentResult {
  expected_crypto_amount?: number;
  currency?: string;
  timeout_at?: string;
  payment_address?: string;
  network?: string;
  transaction_id?: string;
}

interface PaymentInstructionsCardProps {
  amount: number;
  paymentResult: PaymentResult | null;
  onCopyToClipboard: (text: string | undefined, description: string) => void;
  onExternalLink: (address: string | undefined) => void;
  onBackToOptions: () => void;
  onNavigateToTransactions: () => void;
  getNetworkDisplayName: (network: string) => string;
}

const PaymentInstructionsCard: React.FC<PaymentInstructionsCardProps> = ({
  amount,
  paymentResult,
  onCopyToClipboard,
  onExternalLink,
  onBackToOptions,
  onNavigateToTransactions,
  getNetworkDisplayName
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className={cn("bg-gradient-to-r from-green-50 to-blue-50", isMobile && "p-4")}>
        <CardTitle className={cn(
          "text-center flex items-center justify-center gap-2 text-green-700 font-bold",
          isMobile ? "text-xl" : "text-2xl"
        )}>
          <PartyPopper className="h-6 w-6 text-green-600" />
          CONGRATULATIONS!
          <PartyPopper className="h-6 w-6 text-green-600" />
        </CardTitle>
        <CardDescription className={cn(
          "text-center font-semibold text-green-600",
          isMobile ? "text-sm" : "text-base"
        )}>
          Your final step is to SEND Your Crypto Payment Please complete your payment within 5 Minutes
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("pt-6 space-y-4", isMobile && "pt-4 p-4 space-y-3")}>
        <div className={cn("rounded-lg bg-muted p-4", isMobile && "p-3")}>
          <h4 className={cn("font-medium mb-1", isMobile && "text-sm")}>Send exactly</h4>
          <div className={cn("text-2xl font-bold mb-2", isMobile && "text-xl")}>
            {paymentResult?.expected_crypto_amount?.toFixed(8)} {paymentResult?.currency}
          </div>
          <div className={cn("text-sm text-muted-foreground mb-2", isMobile && "text-xs")}>
            (${amount.toFixed(2)} USD value)
          </div>
          <div className={cn("text-xs text-amber-600", isMobile && "text-xs")}>
            Payment will expire on {paymentResult?.timeout_at ? new Date(paymentResult?.timeout_at).toLocaleString() : ''}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className={cn("text-sm", isMobile && "text-xs")}>Send to this wallet address:</Label>
          <div className={cn("flex items-center gap-2 mt-1", isMobile && "flex-col gap-2")}>
            <Input 
              value={paymentResult?.payment_address || ''} 
              readOnly 
              className={cn("font-mono text-xs", isMobile && "text-xs w-full")}
            />
            <div className={cn("flex gap-2", isMobile && "w-full justify-center")}>
              <Button 
                size="icon" 
                variant="outline"
                onClick={() => onCopyToClipboard(paymentResult?.payment_address, 'wallet address')}
                className={cn(isMobile && "h-8 w-8")}
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline"
                onClick={() => onExternalLink(paymentResult?.payment_address)}
                className={cn(isMobile && "h-8 w-8")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className={cn("rounded-lg border p-4", isMobile && "p-3")}>
          <h4 className={cn("font-medium mb-2", isMobile && "text-sm mb-1")}>Payment Details</h4>
          <div className={cn("grid grid-cols-2 gap-2 text-sm", isMobile && "text-xs gap-1")}>
            <div className="text-muted-foreground">Network:</div>
            <div className="font-medium">{getNetworkDisplayName(paymentResult?.network || '')}</div>
            <div className="text-muted-foreground">Currency:</div>
            <div className="font-medium">{paymentResult?.currency}</div>
            <div className="text-muted-foreground">Transaction ID:</div>
            <div className="font-medium truncate">{paymentResult?.transaction_id}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className={cn("flex-col space-y-2", isMobile && "p-4 pt-0")}>
        <div className={cn("text-sm text-center text-muted-foreground mb-2", isMobile && "text-xs")}>
          After sending payment, our team will verify and credit your account. You can track the status of your transaction on the{' '}
          <button
            onClick={onNavigateToTransactions}
            className="text-primary hover:text-primary/80 underline font-medium"
          >
            Transactions
          </button>
          {' '}page.
        </div>
        <Button 
          variant="outline" 
          onClick={onBackToOptions}
          className="w-full"
          size={isMobile ? "sm" : "default"}
        >
          Back to payment options
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentInstructionsCard;
