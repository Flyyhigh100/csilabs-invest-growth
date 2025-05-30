
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  useDirectCryptoPayment 
} from '@/hooks/payments/useDirectCryptoPayment';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ArrowRight, CopyIcon, ExternalLink, RefreshCw } from 'lucide-react';
import { useTokenPrice } from '@/context/TokenPriceContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface DirectCryptoPaymentTabProps {
  walletAddress: string;
  amount: number;
}

const DirectCryptoPaymentTab: React.FC<DirectCryptoPaymentTabProps> = ({ walletAddress, amount }) => {
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const { currentPrice } = useTokenPrice();
  
  const {
    selectedNetwork,
    selectedCurrency,
    availableNetworks,
    availableCurrencies,
    walletAddresses,
    isLoadingAddresses,
    isCreatingPayment,
    setSelectedNetwork,
    setSelectedCurrency,
    createPayment,
    paymentResult
  } = useDirectCryptoPayment();
  
  // Calculate token amount based on current price
  const tokenAmount = currentPrice ? amount / currentPrice : 0;

  const handleCreatePayment = async () => {
    if (amount < 1) {
      toast.error('Minimum amount is $1');
      return;
    }

    try {
      const result = await createPayment(amount, walletAddress);
      if (result) {
        setShowPaymentInstructions(true);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const copyToClipboard = (text: string | undefined, description: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${description} to clipboard`);
  };

  const handleExternalLink = (address: string | undefined) => {
    if (!address) return;
    
    const baseUrl = selectedNetwork === 'polygon' 
      ? 'https://polygonscan.com/address/' 
      : 'https://solscan.io/account/';
    
    window.open(baseUrl + address, '_blank');
  };

  if (isLoadingAddresses) {
    return (
      <div className="flex items-center justify-center p-6">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>Loading payment options...</span>
      </div>
    );
  }

  if (walletAddresses.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md bg-gray-50">
        <h3 className="text-lg font-medium mb-2">Direct payments unavailable</h3>
        <p className="text-muted-foreground mb-4">
          No company wallet addresses are currently configured. Please try another payment method.
        </p>
        <div className="text-sm text-gray-500">
          Contact support if you believe this is an error.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showPaymentInstructions ? (
        <>
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <h4 className="font-medium mb-1">Purchase Summary</h4>
              <div className="text-lg font-semibold text-blue-900">
                ${amount.toFixed(2)} USD
              </div>
              {currentPrice && (
                <div className="text-sm text-blue-700">
                  Approximately {tokenAmount.toFixed(2)} CSI tokens at ${currentPrice.toFixed(2)}/token
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="network-select">Network</Label>
                <Select 
                  value={selectedNetwork} 
                  onValueChange={(value) => setSelectedNetwork(value as 'polygon' | 'solana')}
                >
                  <SelectTrigger id="network-select" className="mt-1.5">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableNetworks.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network === 'polygon' ? 'Polygon' : 'Solana'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="currency-select">Currency</Label>
                <Select 
                  value={selectedCurrency} 
                  onValueChange={(value) => setSelectedCurrency(value as 'USDT' | 'USDC')}
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
          </div>
          
          <div>
            <Button 
              onClick={handleCreatePayment} 
              className="w-full"
              disabled={isCreatingPayment || amount < 1}
              size="lg"
            >
              {isCreatingPayment ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating payment...
                </>
              ) : (
                <>
                  Continue with Direct ${selectedCurrency} Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Send stablecoins directly from your wallet to our address
            </p>
          </div>
        </>
      ) : (
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-center">Payment Instructions</CardTitle>
            <CardDescription className="text-center">
              Please complete your payment within 5 minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-1">Send exactly</h4>
              <div className="text-2xl font-bold mb-2">
                {paymentResult?.expected_crypto_amount} {paymentResult?.currency}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                (${amount.toFixed(2)} USD value)
              </div>
              <div className="text-xs text-amber-600">
                Payment will expire on {paymentResult?.timeout_at ? new Date(paymentResult?.timeout_at).toLocaleTimeString() : ''}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Send to this wallet address:</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={paymentResult?.payment_address || ''} 
                  readOnly 
                  className="font-mono text-xs"
                />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => copyToClipboard(paymentResult?.payment_address, 'wallet address')}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => handleExternalLink(paymentResult?.payment_address)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">Payment Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Network:</div>
                <div className="font-medium">{paymentResult?.network === 'polygon' ? 'Polygon' : 'Solana'}</div>
                <div className="text-muted-foreground">Currency:</div>
                <div className="font-medium">{paymentResult?.currency}</div>
                <div className="text-muted-foreground">Transaction ID:</div>
                <div className="font-medium truncate">{paymentResult?.transaction_id}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground mb-2">
              After sending payment, our team will verify and credit your account.
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentInstructions(false)}
              className="w-full"
            >
              Back to payment options
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">Important Notes</h4>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>Send only {selectedCurrency} on the {selectedNetwork} network</li>
          <li>Payment will be verified manually by our team</li>
          <li>Tokens will be distributed after verification (typically within 24 hours)</li>
          <li>Minimum purchase amount is $1</li>
        </ul>
      </div>
    </div>
  );
};

export default DirectCryptoPaymentTab;
