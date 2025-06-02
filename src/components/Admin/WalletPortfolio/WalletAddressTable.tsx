
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
  DollarSign
} from 'lucide-react';
import { useWalletAddresses, WalletAddress } from '@/hooks/admin/useWalletAddresses';
import { useCryptoPrices } from '@/hooks/admin/useCryptoPrices';
import { formatDistanceToNow } from 'date-fns';

const WalletAddressTable: React.FC = () => {
  const { data: walletAddresses, isLoading, error } = useWalletAddresses();
  const { data: prices } = useCryptoPrices();

  const getExplorerUrl = (network: string, address: string) => {
    const explorers: Record<string, string> = {
      'polygon': `https://polygonscan.com/address/${address}`,
      'ethereum': `https://etherscan.io/address/${address}`,
      'binance-smart-chain': `https://bscscan.com/address/${address}`,
      'solana': `https://solscan.io/account/${address}`,
      'bitcoin': `https://blockchair.com/bitcoin/address/${address}`
    };
    return explorers[network] || '';
  };

  const getNetworkDisplayName = (network: string) => {
    const names: Record<string, string> = {
      'polygon': 'Polygon',
      'ethereum': 'Ethereum',
      'binance-smart-chain': 'BSC',
      'solana': 'Solana',
      'bitcoin': 'Bitcoin'
    };
    return names[network] || network;
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
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
          <CardTitle>Wallet Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
          <CardTitle>Wallet Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Wallet Addresses</h3>
            <p className="text-gray-500">
              No wallet addresses found in the database.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Addresses ({walletAddresses.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your wallet addresses with current market prices. Click "View on Explorer" to check actual balances.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Network</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead className="text-right">Market Price</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {walletAddresses.map((wallet) => {
              const currentPrice = getCurrentPrice(wallet.currency);
              return (
                <TableRow key={wallet.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {getNetworkDisplayName(wallet.network)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{wallet.currency}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {truncateAddress(wallet.wallet_address)}
                      </code>
                      <CopyButton 
                        value={wallet.wallet_address}
                        variant="ghost"
                        size="sm"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {currentPrice ? (
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="font-medium text-green-600">
                          ${currentPrice.toFixed(currentPrice > 1 ? 2 : 6)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Loading...</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(wallet.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = getExplorerUrl(wallet.network, wallet.wallet_address);
                          if (url) window.open(url, '_blank');
                        }}
                        disabled={!getExplorerUrl(wallet.network, wallet.wallet_address)}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on Explorer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WalletAddressTable;
