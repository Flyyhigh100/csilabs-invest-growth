
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Wallet, 
  RefreshCw, 
  TrendingUp, 
  DollarSign,
  ExternalLink,
  AlertCircle,
  Info
} from 'lucide-react';
import { useWalletBalances, useWalletPortfolioSummary, useRefreshWalletBalances } from '@/hooks/admin/useWalletBalances';
import { formatDistanceToNow } from 'date-fns';
import AdminLayout from '@/components/Admin/Layout';
import WalletAddressTable from '@/components/Admin/WalletPortfolio/WalletAddressTable';
import MarketPricesCard from '@/components/Admin/WalletPortfolio/MarketPricesCard';

const WalletPortfolioPage: React.FC = () => {
  const { data: balances, isLoading: balancesLoading, error } = useWalletBalances();
  const { data: portfolio, isLoading: portfolioLoading } = useWalletPortfolioSummary();
  const refreshBalances = useRefreshWalletBalances();

  const isLoading = balancesLoading || portfolioLoading;

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

  return (
    <AdminLayout title="Wallet Portfolio">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Wallet Portfolio</h1>
          <Button
            onClick={() => refreshBalances.mutate()}
            disabled={refreshBalances.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
            Refresh Balances
          </Button>
        </div>

        {/* Info Alert */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Wallet Management Dashboard</p>
                <p>
                  Below you can see current market prices and all your wallet addresses with direct links to blockchain explorers. 
                  Use "View on Explorer" to manually check current balances.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Prices Card */}
        <MarketPricesCard />

        {/* Portfolio Summary Cards - Only show if we have balance data */}
        {portfolio && !error && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${portfolio.total_usd_value.toFixed(2)}</div>
                {portfolio.last_updated && (
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(portfolio.last_updated), { addSuffix: true })}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolio.total_wallets}</div>
                <p className="text-xs text-muted-foreground">
                  Across {Object.keys(portfolio.balances_by_currency).length} currencies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest Holding</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {(() => {
                  const largest = Object.entries(portfolio.balances_by_currency)
                    .sort(([,a], [,b]) => b.balance_usd - a.balance_usd)[0];
                  
                  return largest ? (
                    <>
                      <div className="text-2xl font-bold">${largest[1].balance_usd.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        {largest[1].balance.toFixed(6)} {largest[0]}
                      </p>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">-</div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wallet Addresses Table - Always show */}
        <WalletAddressTable />

        {/* Detailed Balance Table - Only show if we have balance data */}
        {balances && balances.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Live Balance Data</CardTitle>
              <p className="text-sm text-muted-foreground">
                Automatically fetched balance information from blockchain APIs
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Network</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">USD Value</TableHead>
                    <TableHead className="text-right">Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.map((balance) => (
                    <TableRow key={balance.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {getNetworkDisplayName(balance.network)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{balance.currency}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm max-w-[200px] truncate">
                          {balance.wallet_address}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {balance.balance.toFixed(6)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {balance.currency}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium text-green-600">
                          ${balance.balance_usd.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs text-gray-500">
                        {formatDistanceToNow(new Date(balance.last_updated_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const url = getExplorerUrl(balance.network, balance.wallet_address);
                            if (url) window.open(url, '_blank');
                          }}
                          disabled={!getExplorerUrl(balance.network, balance.wallet_address)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="py-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-700 mb-2">Balance Fetching Error</h3>
                <p className="text-gray-600 mb-4">{error.message}</p>
                <p className="text-sm text-gray-500 mb-4">
                  You can still view wallet addresses above and check balances manually on blockchain explorers.
                </p>
                <Button 
                  onClick={() => refreshBalances.mutate()}
                  disabled={refreshBalances.isPending}
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default WalletPortfolioPage;
