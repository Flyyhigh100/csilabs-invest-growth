
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, RefreshCw, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWalletPortfolioSummary, useRefreshWalletBalances } from '@/hooks/admin/useWalletBalances';
import { formatDistanceToNow } from 'date-fns';

const WalletPortfolioCard: React.FC = () => {
  const { data: portfolio, isLoading } = useWalletPortfolioSummary();
  const refreshBalances = useRefreshWalletBalances();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enhanced Wallet Portfolio</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!portfolio) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enhanced Wallet Portfolio</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">No wallet data available</p>
            <p className="text-xs text-gray-500 mb-3">
              Fetch balances using Moralis API for your payment wallets
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshBalances.mutate()}
              disabled={refreshBalances.isPending}
              className="mt-2"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
              Fetch Live Balances
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topCurrencies = Object.entries(portfolio.balances_by_currency)
    .sort(([,a], [,b]) => b.balance_usd - a.balance_usd)
    .slice(0, 4); // Show top 4

  const stablecoins = topCurrencies.filter(([currency]) => 
    ['USDT', 'USDC', 'BUSD', 'DAI'].includes(currency)
  );
  
  const nativeTokens = topCurrencies.filter(([currency]) => 
    ['BTC', 'ETH', 'BNB', 'SOL', 'MATIC'].includes(currency)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Enhanced Wallet Portfolio</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refreshBalances.mutate()}
            disabled={refreshBalances.isPending}
            title="Refresh using Moralis API"
          >
            <RefreshCw className={`h-4 w-4 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
          </Button>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              ${portfolio.total_usd_value.toFixed(2)}
            </span>
          </div>

          {/* Network Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-700">Networks</div>
              <div className="text-gray-600">5 supported</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-700">Currencies</div>
              <div className="text-gray-600">{Object.keys(portfolio.balances_by_currency).length} tracked</div>
            </div>
          </div>

          {/* Stablecoins Section */}
          {stablecoins.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Stablecoins</span>
              </div>
              <div className="space-y-1">
                {stablecoins.map(([currency, data]) => (
                  <div key={currency} className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="font-mono text-green-700 border-green-200">
                      {currency}
                    </Badge>
                    <div className="text-right">
                      <div className="font-medium">${data.balance_usd.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {data.balance.toFixed(2)} {currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Native Tokens Section */}
          {nativeTokens.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Native Tokens</span>
              </div>
              <div className="space-y-1">
                {nativeTokens.slice(0, 3).map(([currency, data]) => (
                  <div key={currency} className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="font-mono text-blue-700 border-blue-200">
                      {currency}
                    </Badge>
                    <div className="text-right">
                      <div className="font-medium">${data.balance_usd.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {data.balance.toFixed(6)} {currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          {portfolio.last_updated && (
            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              <div className="flex items-center justify-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                Updated {formatDistanceToNow(new Date(portfolio.last_updated), { addSuffix: true })}
              </div>
            </div>
          )}

          {/* View Details Button */}
          <Button asChild variant="outline" className="w-full" size="sm">
            <Link to="/admin/wallet-portfolio">
              View Detailed Portfolio
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPortfolioCard;
