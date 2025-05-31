
import React from 'react';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTokenPrice } from '@/context/TokenPriceContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface PaymentConfigurationFormProps {
  amount: number;
  selectedNetwork: string;
  selectedCurrency: string;
  availableNetworks: string[];
  availableCurrencies: string[];
  isCreatingPayment: boolean;
  onNetworkChange: (network: string) => void;
  onCurrencyChange: (currency: string) => void;
  onCreatePayment: () => void;
  getNetworkDisplayName: (network: string) => string;
  isStablecoin: (currency: string) => boolean;
}

const PaymentConfigurationForm: React.FC<PaymentConfigurationFormProps> = ({
  amount,
  selectedNetwork,
  selectedCurrency,
  availableNetworks,
  availableCurrencies,
  isCreatingPayment,
  onNetworkChange,
  onCurrencyChange,
  onCreatePayment,
  getNetworkDisplayName,
  isStablecoin
}) => {
  const { currentPrice } = useTokenPrice();
  const isMobile = useIsMobile();
  
  const tokenAmount = currentPrice ? amount / currentPrice : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-3 md:p-4 border border-blue-200">
          <h4 className="font-medium mb-1 text-sm md:text-base">Purchase Summary</h4>
          <div className="text-lg md:text-xl font-semibold text-blue-900">
            ${amount.toFixed(2)} USD
          </div>
          {currentPrice && (
            <div className="text-xs md:text-sm text-blue-700">
              Approximately {tokenAmount.toFixed(2)} CSI tokens at ${currentPrice.toFixed(2)}/token
            </div>
          )}
        </div>
        
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        )}>
          <div>
            <Label htmlFor="network-select" className="text-sm">Choose Payment Coin Network</Label>
            <Select 
              value={selectedNetwork} 
              onValueChange={onNetworkChange}
            >
              <SelectTrigger id="network-select" className="mt-1.5">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {availableNetworks.map((network) => (
                  <SelectItem key={network} value={network}>
                    {getNetworkDisplayName(network)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="currency-select" className="text-sm">Choose Currency</Label>
            <Select 
              value={selectedCurrency} 
              onValueChange={onCurrencyChange}
            >
              <SelectTrigger id="currency-select" className="mt-1.5">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isStablecoin(selectedCurrency) && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Price Volatility Notice:</strong> {selectedCurrency} prices can change rapidly. 
              The exact amount required will be calculated at payment time and you'll have 30 minutes to complete the transaction.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div>
        <Button 
          onClick={onCreatePayment} 
          className="w-full"
          disabled={isCreatingPayment || amount < 1}
          size={isMobile ? "default" : "lg"}
        >
          {isCreatingPayment ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Creating payment...
            </>
          ) : (
            <>
              {isMobile ? (
                `Continue with ${selectedCurrency} Payment`
              ) : (
                `Continue with Direct ${selectedCurrency} Payment`
              )}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        <p className="mt-2 text-xs text-center text-muted-foreground px-2">
          Send {selectedCurrency} directly from your wallet to our address
        </p>
      </div>
    </div>
  );
};

export default PaymentConfigurationForm;
