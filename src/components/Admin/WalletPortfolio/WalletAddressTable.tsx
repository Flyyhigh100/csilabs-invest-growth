
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ExternalLink,
  Wallet,
  AlertCircle,
  DollarSign,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useWalletAddresses, getNetworkInfo, getCurrencyInfo } from '@/hooks/admin/useWalletAddresses';
import { useCryptoPrices } from '@/hooks/admin/useCryptoPrices';
import { formatDistanceToNow } from 'date-fns';

const WalletAddressTable: React.FC = () => {
  const { data: walletAddresses, isLoading, error } = useWalletAddresses();
  const { data: prices } = useCryptoPrices();

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const getCurrentPrice = (currency: string) => {
    if (!prices) return null;
    return prices[currency]?.price || null;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Wallet Addresses</h3>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            Loading Enhanced Wallet Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!walletAddresses || walletAddresses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Wallet Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Wallet Addresses</h3>
            <p className="text-gray-500">
              No payment wallet addresses found. Click "Refresh Balances" to set up monitoring.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group wallets by address for better organization
  const walletGroups = walletAddresses.reduce((groups, wallet) => {
    if (!groups[wallet.wallet_address]) {
      groups[wallet.wallet_address] = [];
    }
    groups[wallet.wallet_address].push(wallet);
    return groups;
  }, {} as Record<string, typeof walletAddresses>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Payment Wallet Addresses ({walletAddresses.length} currencies across {Object.keys(walletGroups).length} addresses)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your payment receiving addresses monitored across Bitcoin, Ethereum, Polygon, BSC, and Solana networks.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(walletGroups).map(([address, wallets]) => {
            const networks = [...new Set(wallets.map(w => w.network))];
            const networkInfo = getNetworkInfo(wallets[0].network);
            
            return (
              <div key={address} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-3 py-1 rounded-md font-mono">
                        {truncateAddress(address)}
                      </code>
                      <CopyButton 
                        value={address}
                        variant="ghost"
                        size="sm"
                      />
                    </div>
                    <div className="flex gap-1">
                      {networks.map(network => {
                        const info = getNetworkInfo(network);
                        return (
                          <Badge key={network} variant="outline" className={info.color}>
                            {info.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = networkInfo.explorer + address;
                      if (url) window.open(url, '_blank');
                    }}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Explorer
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Live Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets.map((wallet) => {
                      const currentPrice = getCurrentPrice(wallet.currency);
                      const currencyInfo = getCurrencyInfo(wallet.currency);
                      
                      return (
                        <TableRow key={`${wallet.id}-${wallet.currency}`}>
                          <TableCell>
                            <div className="font-medium">{wallet.currency}</div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={currencyInfo.isStablecoin ? 'text-green-700 border-green-200' : 'text-blue-700 border-blue-200'}
                            >
                              {currencyInfo.isStablecoin ? 'Stablecoin' : 'Native'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {currentPrice ? (
                              <div className="flex items-center justify-end gap-1">
                                <DollarSign className="h-3 w-3 text-green-600" />
                                <span className="font-medium text-green-600">
                                  {currencyInfo.isStablecoin ? '$1.00' : `$${currentPrice.toFixed(currentPrice > 1 ? 2 : 6)}`}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Loading...</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-600">Active</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Enhanced Monitoring Active</p>
              <p>
                Using Moralis API for Ethereum/Polygon/BSC, Solana RPC for SOL, and Blockstream for Bitcoin. 
                Stablecoins are priced at $1.00, native tokens use live market prices from CoinCap.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletAddressTable;
