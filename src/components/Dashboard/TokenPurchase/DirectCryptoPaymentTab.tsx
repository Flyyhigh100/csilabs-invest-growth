
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, QrCode, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDirectCryptoPayment } from '@/hooks/payments/useDirectCryptoPayment';
import { useTokenPrice } from '@/context/TokenPriceContext';
import { cn } from '@/lib/utils';

interface DirectCryptoPaymentTabProps {
  walletAddress: string;
}

const DirectCryptoPaymentTab: React.FC<DirectCryptoPaymentTabProps> = ({ walletAddress }) => {
  const [amount, setAmount] = useState<string>('100');
  const { currentPrice } = useTokenPrice();
  
  const {
    selectedNetwork,
    selectedCurrency,
    selectedWalletAddress,
    availableNetworks,
    availableCurrencies,
    isLoadingAddresses,
    isCreatingPayment,
    setSelectedNetwork,
    setSelectedCurrency,
    createPayment,
    paymentResult,
  } = useDirectCryptoPayment();

  // Calculate token amount
  const usdAmount = parseFloat(amount) || 0;
  const tokenAmount = currentPrice ? (usdAmount / currentPrice).toFixed(6) : '0';
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const handleCreatePayment = async () => {
    if (!walletAddress) {
      toast.error('Please set your wallet address first');
      return;
    }

    if (usdAmount < 1) {
      toast.error('Minimum purchase amount is $1');
      return;
    }

    await createPayment(usdAmount, walletAddress);
  };

  const formatTimeout = (timeoutAt: string) => {
    const timeout = new Date(timeoutAt);
    const now = new Date();
    const diff = timeout.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    return minutes > 0 ? `${minutes} minutes` : 'Expired';
  };

  if (isLoadingAddresses) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!paymentResult ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Direct Crypto Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount in USD"
                />
                {currentPrice && (
                  <p className="text-sm text-muted-foreground">
                    ≈ {tokenAmount} CSL tokens
                  </p>
                )}
              </div>

              {/* Network Selection */}
              <div className="space-y-2">
                <Label>Network</Label>
                <Select 
                  value={selectedNetwork} 
                  onValueChange={(value: 'polygon' | 'solana') => setSelectedNetwork(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableNetworks.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network.charAt(0).toUpperCase() + network.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Currency Selection */}
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={selectedCurrency} 
                  onValueChange={(value: 'USDT' | 'USDC') => setSelectedCurrency(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
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

              {/* Wallet Address Display */}
              <div className="space-y-2">
                <Label>Company Wallet Address</Label>
                {selectedWalletAddress ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={selectedWalletAddress.wallet_address}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyAddress(selectedWalletAddress.wallet_address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No wallet address available for selected network/currency
                  </div>
                )}
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Payment Instructions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Send exactly the calculated amount to the provided wallet address</li>
                    <li>• Use the correct network ({selectedNetwork}) and currency ({selectedCurrency})</li>
                    <li>• Payment will be manually verified by our admin team</li>
                    <li>• Tokens will be distributed after verification (usually within 24 hours)</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreatePayment}
              disabled={isCreatingPayment || !selectedWalletAddress || usdAmount < 1}
              className="w-full"
            >
              {isCreatingPayment ? 'Creating Payment...' : 'Create Payment Request'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Payment Created Success */
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Payment Request Created</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Transaction ID</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={paymentResult.transaction_id}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyAddress(paymentResult.transaction_id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Exact Amount to Send</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={`${paymentResult.expected_crypto_amount} ${paymentResult.currency}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyAddress(paymentResult.expected_crypto_amount.toString())}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Send to Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={paymentResult.payment_address}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyAddress(paymentResult.payment_address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Payment window expires in: {formatTimeout(paymentResult.timeout_at)}</span>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-green-900">Next Steps</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Send exactly {paymentResult.expected_crypto_amount} {paymentResult.currency} to the address above</li>
                    <li>• Use {paymentResult.network} network only</li>
                    <li>• Your payment will be verified manually by our team</li>
                    <li>• You'll receive a notification once verified and tokens are distributed</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Create Another Payment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DirectCryptoPaymentTab;
