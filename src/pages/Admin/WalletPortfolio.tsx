
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Info,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useWalletBalances, useWalletPortfolioSummary, useRefreshWalletBalances } from '@/hooks/admin/useWalletBalances';
import { formatDistanceToNow } from 'date-fns';
import AdminLayout from '@/components/Admin/Layout';
import WalletAddressTable from '@/components/Admin/WalletPortfolio/WalletAddressTable';
import EnhancedMarketPricesCard from '@/components/Admin/WalletPortfolio/EnhancedMarketPricesCard';

const WalletPortfolioPage: React.FC = () => {
  const { data: balances, isLoading: balancesLoading, error } = useWalletBalances();
  const { data: portfolio, isLoading: portfolioLoading } = useWalletPortfolioSummary();
  const refreshBalances = useRefreshWalletBalances();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [showZeroBalances, setShowZeroBalances] = useState(false);

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

  const getNetworkColor = (network: string) => {
    const colors: Record<string, string> = {
      'polygon': 'bg-purple-100 text-purple-800 border-purple-200',
      'ethereum': 'bg-blue-100 text-blue-800 border-blue-200',
      'binance-smart-chain': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'solana': 'bg-green-100 text-green-800 border-green-200',
      'bitcoin': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[network] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Filter balances based on search and network selection
  const filteredBalances = balances?.filter(balance => {
    const matchesSearch = balance.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         balance.wallet_address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNetwork = selectedNetwork === 'all' || balance.network === selectedNetwork;
    const matchesZeroBalance = showZeroBalances || balance.balance > 0;
    
    return matchesSearch && matchesNetwork && matchesZeroBalance;
  }) || [];

  const uniqueNetworks = [...new Set(balances?.map(b => b.network) || [])];

  return (
    <AdminLayout title="Enhanced Wallet Portfolio">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Wallet Portfolio
            </h1>
            <p className="text-gray-600 mt-1">Real-time portfolio monitoring across multiple blockchains</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => refreshBalances.mutate()}
              disabled={refreshBalances.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
              Refresh Balances
            </Button>
          </div>
        </div>

        {/* Enhanced Info Alert */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Enhanced Portfolio Management</p>
                <p>
                  Real-time pricing with Moralis API integration. Auto-refresh every 30 seconds. 
                  Prices are validated to ensure accuracy - Bitcoin should now show ~$100k+.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Market Prices Card */}
        <EnhancedMarketPricesCard />

        {/* Enhanced Portfolio Summary Cards */}
        {portfolio && !error && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${portfolio.total_usd_value.toFixed(2)}
                </div>
                {portfolio.last_updated && (
                  <p className="text-xs text-green-600/70">
                    Updated {formatDistanceToNow(new Date(portfolio.last_updated), { addSuffix: true })}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Active Wallets</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{portfolio.total_wallets}</div>
                <p className="text-xs text-blue-600/70">
                  Across {Object.keys(portfolio.balances_by_currency).length} currencies
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Largest Holding</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                {(() => {
                  const largest = Object.entries(portfolio.balances_by_currency)
                    .sort(([,a], [,b]) => b.balance_usd - a.balance_usd)[0];
                  
                  return largest ? (
                    <>
                      <div className="text-3xl font-bold text-purple-600">${largest[1].balance_usd.toFixed(2)}</div>
                      <p className="text-xs text-purple-600/70">
                        {largest[1].balance.toFixed(6)} {largest[0]}
                      </p>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-purple-600">-</div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wallet Addresses Table */}
        <WalletAddressTable />

        {/* Enhanced Balance Table with Filters */}
        {balances && balances.length > 0 && (
          <Card className="border-2 border-gray-100 shadow-lg">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Live Balance Data
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Real-time balance information with enhanced pricing validation
                  </p>
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search currency or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <select
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                  >
                    <option value="all">All Networks</option>
                    {uniqueNetworks.map(network => (
                      <option key={network} value={network}>
                        {getNetworkDisplayName(network)}
                      </option>
                    ))}
                  </select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowZeroBalances(!showZeroBalances)}
                  >
                    {showZeroBalances ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                    {showZeroBalances ? 'Hide' : 'Show'} Zero Balances
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Network</TableHead>
                      <TableHead className="font-semibold">Currency</TableHead>
                      <TableHead className="font-semibold">Wallet Address</TableHead>
                      <TableHead className="text-right font-semibold">Balance</TableHead>
                      <TableHead className="text-right font-semibold">USD Value</TableHead>
                      <TableHead className="text-right font-semibold">Last Updated</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBalances.map((balance) => (
                      <TableRow key={balance.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>
                          <Badge variant="outline" className={getNetworkColor(balance.network)}>
                            {getNetworkDisplayName(balance.network)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-lg">{balance.currency}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm max-w-[200px] truncate bg-gray-100 px-2 py-1 rounded">
                            {balance.wallet_address}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold text-lg">
                            {balance.balance.toFixed(6)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {balance.currency}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold text-lg text-green-600">
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
                            className="hover:bg-blue-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredBalances.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No balances match your current filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enhanced Error Display */}
        {error && (
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <CardContent className="py-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-orange-700 mb-2">Balance Fetching Issue</h3>
                <p className="text-gray-600 mb-4">{error.message}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Market prices are still available above. Use "View on Explorer" to check balances manually.
                </p>
                <Button 
                  onClick={() => refreshBalances.mutate()}
                  disabled={refreshBalances.isPending}
                  variant="outline"
                  className="border-orange-300 hover:bg-orange-100"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
                  Retry Balance Fetch
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
